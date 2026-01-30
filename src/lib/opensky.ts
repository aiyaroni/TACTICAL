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
// Monitoring Targets: E-4B "Nightwatch" (US) + Regional Tankers (KC-135/Il-76) + Iran Vector
const TARGET_ICAOS = [
    'adfeb3', // E-4B (73-1676)
    'adfeb4', // E-4B (73-1677)
    'adfeb5', // E-4B (74-0787)
    'adfeb6', // E-4B (75-0125)
    'ae01d2', // KC-135 Stratotanker
    'ae04d7', // KC-135 Rivet Joint support
    '154078', // Il-76TD (Regional/Cargo - Simulated for Iran Vector)
    '738011', // EP-IFA (Iran Air A300 - Simulated Routine Traffic)
    '738012', // EP-IBB (Iran Air A300 - Simulated)
    '738031'  // EP-MNH (Mahan Air A340 - Simulated IRGC Logistics)
];

export async function fetchTacticalData(): Promise<OpenSkyState[]> {
    const username = process.env.OPENSKY_CLIENT_ID?.replace(/"/g, '');
    const password = process.env.OPENSKY_CLIENT_SECRET?.replace(/"/g, '');

    if (!username || !password) {
        console.warn('OpenSky credentials (OPENSKY_CLIENT_ID/SECRET) missing. Returning Mock Data equivalent (empty).');
        return [];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    // Bounding Box for "Sector 7" (Middle East: Israel, Iran, Gulf)
    // lamin, lomin, lamax, lomax
    const params = new URLSearchParams({
        lamin: '24.0',
        lomin: '34.0',
        lamax: '42.0',
        lomax: '60.0'
    });

    const fetchUrl = `${OPENSKY_API_URL}?${params.toString()}`;
    console.log(`[OpenSky] Fetching Sector 7: ${fetchUrl}`);

    try {
        const response = await fetch(fetchUrl, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
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

        // OpenSky returns states as an array of arrays
        /*
          0: icao24
          1: callsign
          2: origin_country
          3: time_position
          4: last_contact
          5: longitude
          6: latitude
          7: baro_altitude
          8: on_ground
          9: velocity
          10: true_track
          11: vertical_rate
          12: sensors
          13: geo_altitude
          14: squawk
          15: spi
          16: position_source
        */

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
        console.error('Failed to fetch OpenSky data (Strict Mode - No Mocking):', error);
        return [];
    }
}
