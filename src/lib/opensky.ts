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

// TACTICAL SIMULATION CONFIG
// USER_REQUEST: "Switch the Aviation component to MOCK MODE. Hardcode 54 Civil and 12 Logistics."
const SIM_CONFIG = {
    civilCount: 54,
    milCount: 12
};

const MILITARY_ICAOS = ['adfeb3', 'adfeb4', 'adfeb5', 'adfeb6', 'ae01d2', 'ae04d7', '154078', '738011', '738012', '738031'];

function generateMockTraffic(): OpenSkyState[] {
    console.warn("[OPENSKY] TACTICAL SIMULATION MODE ACTIVE.");
    const mockStates: OpenSkyState[] = [];
    const timestamp = Math.floor(Date.now() / 1000);

    // 1. Generate Civil Traffic (Green Dots)
    for (let i = 0; i < SIM_CONFIG.civilCount; i++) {
        mockStates.push({
            icao24: `sim_civ_${i.toString(16)}`,
            callsign: `CIV${100 + i}`,
            origin_country: "Simulated Civil",
            time_position: timestamp,
            last_contact: timestamp,
            // Random distribution within Lat 29-35, Lon 33-39 (Israel/Levant Core)
            latitude: 29 + Math.random() * 6,
            longitude: 33 + Math.random() * 6,
            baro_altitude: 5000 + Math.random() * 30000,
            on_ground: false,
            velocity: 250 + Math.random() * 200,
            true_track: Math.random() * 360,
            vertical_rate: 0,
            sensors: null,
            geo_altitude: null,
            squawk: null,
            spi: false,
            position_source: 0
        });
    }

    // 2. Generate Military/Logistics Traffic (Red/Amber)
    // We reuse known Military ICAOs to trigger the "Military" type in frontend logic if possible, 
    // or just use the count logic which relies on ICAO matching in page.tsx 
    // (page.tsx uses `MILITARY_ICAOS` list locally to filter).
    // So we MUST use real Military ICAOs for the first few to be counted as E4B/Tankers.

    for (let i = 0; i < SIM_CONFIG.milCount; i++) {
        // Cycle through known IDs to ensure they are flagged as Military
        const realId = MILITARY_ICAOS[i % MILITARY_ICAOS.length];
        mockStates.push({
            icao24: realId, // This triggers the "Red Jet" logic in page.tsx
            callsign: `MIL${i}`,
            origin_country: "USA",
            time_position: timestamp,
            last_contact: timestamp,
            latitude: 30 + Math.random() * 4,
            longitude: 34 + Math.random() * 4,
            baro_altitude: 20000 + Math.random() * 15000,
            on_ground: false,
            velocity: 400 + Math.random() * 100,
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

export async function fetchTacticalData(): Promise<OpenSkyState[]> {
    // FORCE SIMULATION MODE
    // Ignoring API credentials and calls as per "MISSION FAILURE so far" command.
    return generateMockTraffic();
}
