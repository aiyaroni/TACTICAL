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
const TARGET_ICAOS = ['ADFEB2', 'ADFEB4', 'ADFEB6'];

export async function fetchTacticalData(): Promise<OpenSkyState[]> {
    const username = process.env.OPENSKY_CLIENT_ID;
    const password = process.env.OPENSKY_CLIENT_SECRET;

    if (!username || !password) {
        console.warn('OpenSky credentials missing');
        return [];
    }

    const headers = new Headers();
    headers.set('Authorization', 'Basic ' + Buffer.from(username + ':' + password).toString('base64'));

    // Build query params
    const params = new URLSearchParams();
    TARGET_ICAOS.forEach((icao) => params.append('icao24', icao));

    try {
        const response = await fetch(`${OPENSKY_API_URL}?${params.toString()}`, {
            headers,
            next: { revalidate: 15 },
        });

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
        console.error('Failed to fetch OpenSky data:', error);
        return [];
    }
}
