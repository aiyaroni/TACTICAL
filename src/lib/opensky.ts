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

const OPENSKY_API_URL = 'https://opensky-network.org/api/states/all';
const AUTH_URL = 'https://auth.opensky-network.org/realms/master/protocol/openid-connect/token';

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
            cache: 'no-store' // Don't cache the token request itself
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

    if (!clientId || !clientSecret) {
        console.warn('OpenSky credentials missing. Returning empty.');
        return [];
    }

    // 1. Get OAuth Token
    const token = await getAccessToken(clientId, clientSecret);
    if (!token) {
        console.error('Failed to obtain OpenSky Bearer Token.');
        return [];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    // Bounding Box for "Sector 7" (Middle East: Israel, Jordan, Lebanon, Syria)
    // Adjusted slightly to ensure full coverage of key areas
    // lamin, lomin, lamax, lomax
    const params = new URLSearchParams({
        lamin: '29.0', // South (Eilat/Aqaba)
        lomin: '33.0', // West (Mediterranean)
        lamax: '34.5', // North (Lebanon/Syria border)
        lomax: '39.0'  // East (Jordan/Syria/Iraq border)
    });

    // NOTE: The user asked for "Middle East (Israel/Jordan/Lebanon)". 
    // Previous was much larger (24-42, 34-60). 
    // Let's stick to the User's explicit hint "Israel/Jordan/Lebanon" but purely ensuring we capture it all.
    // The previous box (24-42, 34-60) was very wide (Egypt to Iran).
    // I Will use a slightly focused box for "Levant" to ensure density is relevant to "Sector 7" (usually Israel/Lebanon context in this app).
    // Actually, let's keep the user's broader 24-42 if they want "Middle East", but "Sector 7" usually implies the immediate conflict zone.
    // I will use a box covering Israel, Lebanon, Syria, Jordan.

    // Israel Lat: ~29.5 to 33.3
    // Israel Lon: ~34.2 to 35.9
    // Provide a safe buffer. 
    params.set('lamin', '28.0');
    params.set('lomin', '33.0');
    params.set('lamax', '35.0');
    params.set('lomax', '38.0');

    // Wait, the prompt says "Set the bounding box for the Middle East (Israel/Jordan/Lebanon)".
    // Maybe I should be generous. Let's use 28-36 Lat, 33-40 Lon.
    // Redoing params for safety.
    params.set('lamin', '28.0');
    params.set('lomin', '32.0');
    params.set('lamax', '36.0');
    params.set('lomax', '40.0');

    const fetchUrl = `${OPENSKY_API_URL}?${params.toString()}`;
    // console.log(`[OpenSky] Fetching: ${fetchUrl}`);

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
            return [];
        }

        const data = await response.json();

        if (!data.states) return [];

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
        return [];
    }
}
