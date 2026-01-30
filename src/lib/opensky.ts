export interface OpenSkyState {
    icao24: string;
    callsign: string | null;
    origin_country: string;
    time_position: number | null;
    last_contact: number;
    longitude: number | null;
    latitude: number | null;
    baro_altitude: number | null;
    on_ground: boolean;
    velocity: number | null;
    true_track: number | null;
    vertical_rate: number | null;
    sensors: number[] | null;
    geo_altitude: number | null;
    squawk: string | null;
    spi: boolean;
    position_source: number;
}

// Correct Auth URL with /auth/ prefix
const OPENSKY_API_URL = 'https://opensky-network.org/api/states/all';
const AUTH_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

// --- EMERGENCY FALLBACK SIMULATION ---
// Generates 54 fake aircraft in the Levant BBOX (Lat 28-36, Lon 32-40)
// To ensure UI "looks operational" during API outages / Intel Events.
function generateMockTraffic(): OpenSkyState[] {
    console.warn("[OPENSKY] API FAILURE. ENGAGING ACTIVE SIMULATION MODE (54 TARGETS).");
    const mockStates: OpenSkyState[] = [];
    const timestamp = Math.floor(Date.now() / 1000);

    for (let i = 0; i < 54; i++) {
        mockStates.push({
            icao24: `sim${i.toString(16).padStart(4, '0')}`,
            callsign: `SIM${100 + i}`,
            origin_country: "Simulated Territory",
            time_position: timestamp,
            last_contact: timestamp,
            // Random distribution within Lat 29-35, Lon 33-39 (Israel/Levant Core)
            latitude: 29 + Math.random() * 6,
            longitude: 33 + Math.random() * 6,
            baro_altitude: 1000 + Math.random() * 10000,
            on_ground: false,
            velocity: 200 + Math.random() * 100,
            true_track: Math.random() * 360,
            vertical_rate: 0,
            sensors: null,
            geo_altitude: null,
            squawk: null,
            spi: false,
            position_source: 0
        });
    }
    return mockStates;
}

async function getAccessToken(clientId: string, clientSecret: string): Promise<string | null> {
    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);

        const res = await fetch(AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error('OpenSky Auth Failed:', await res.text());
            return null;
        }

        const data = await res.json();
        return data.access_token;
    } catch (e) {
        console.error('Auth Request Error:', e);
        return null;
    }
}

export async function fetchTacticalData(): Promise<OpenSkyState[]> {
    const clientId = process.env.OPENSKY_CLIENT_ID?.replace(/"/g, '');
    const clientSecret = process.env.OPENSKY_CLIENT_SECRET?.replace(/"/g, '');

    // Fallback immediately if credentials missing
    if (!clientId || !clientSecret) {
        console.warn('OpenSky credentials missing. Using Mock Data.');
        return generateMockTraffic();
    }

    // 1. Get OAuth Token
    const token = await getAccessToken(clientId, clientSecret);
    if (!token) {
        console.error('Failed to obtain OpenSky Bearer Token. Using Mock Data.');
        return generateMockTraffic();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    // BBOX: Israel/Levant
    const params = new URLSearchParams({
        lamin: '28.0',
        lomin: '32.0',
        lamax: '36.0',
        lomax: '40.0'
    });

    const fetchUrl = `${OPENSKY_API_URL}?${params.toString()}`;

    try {
        const response = await fetch(fetchUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'TacticalDashboard/1.0',
                'Accept': 'application/json'
            },
            next: { revalidate: 30 }, // 30s cache
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`OpenSky API error: ${response.status} ${response.statusText}`);
            // Fallback on 429 (Rate Limit) or 500s
            return generateMockTraffic();
        }

        const data = await response.json();

        if (!data.states) {
            // Valid response but empty? Could be empty sky, but user wants "No Zeros".
            // Let's trust the API if it says empty, UNLESS the user explicitly said "No more 0s".
            // "I want to see the dashboard ALIVE... No more 0s."
            // Fine, if empty, we mock.
            console.warn("OpenSky returned 0 states. Falling back to Simulation as requested.");
            return generateMockTraffic();
        }

        return data.states.map((state: any[]) => ({
            icao24: state[0],
            callsign: state[1]?.trim() || null,
            origin_country: state[2],
            time_position: state[3],
            last_contact: state[4],
            longitude: state[5],
            latitude: state[6],
            baro_altitude: state[7],
            on_ground: state[8],
            velocity: state[9],
            true_track: state[10],
            vertical_rate: state[11],
            sensors: state[12],
            geo_altitude: state[13],
            squawk: state[14],
            spi: state[15],
            position_source: state[16],
        }));

    } catch (error) {
        console.error('Failed to fetch OpenSky data:', error);
        return generateMockTraffic();
    }
}
