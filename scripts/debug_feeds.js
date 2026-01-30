const https = require('https');

// --- OPENSKY CONFIG ---
const CLIENT_ID = 'booldeals-api-client';
const CLIENT_SECRET = 'M0uHDKFeKY0heM7hNWZ5Ay8I6Iu5IxHo';
// Corrected Realm Path: Keycloak often uses /auth/realms/...
const AUTH_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';
const API_URL = 'https://opensky-network.org/api/states/all';

// --- POLYMARKET CONFIG ---
const GAMMA_API = "https://gamma-api.polymarket.com/markets";

async function testOpenSky() {
    console.log('\n--- TESTING OPENSKY ---');

    // 1. Auth Request
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    // params.append('scope', 'airplanes:read'); // Try probing scopes if needed later

    console.log(`Auth Request: POST ${AUTH_URL}`);

    try {
        const authRes = await fetch(AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });

        console.log(`Auth Status: ${authRes.status} ${authRes.statusText}`);
        if (!authRes.ok) {
            console.log(await authRes.text());
            return;
        }

        const authBody = await authRes.json();
        const token = authBody.access_token;
        console.log('Token Acquired (Truncated):', token.substring(0, 20) + '...');

        // 2. Data Request
        const dataParams = new URLSearchParams({
            lamin: '28.0', lomin: '32.0', lamax: '36.0', lomax: '40.0'
        });
        const url = `${API_URL}?${dataParams.toString()}`;
        console.log(`Data Request: GET ${url}`);

        const dataRes = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log(`Data Status: ${dataRes.status} ${dataRes.statusText}`);
        const dataJson = await dataRes.json();

        if (dataJson.states) {
            console.log(`SUCCESS: Found ${dataJson.states.length} states.`);
            // console.log('Sample:', dataJson.states[0]);
        } else {
            console.log('SUCCESS: Valid response but no states found (or format differs).');
        }

    } catch (e) {
        console.error('OpenSky Error:', e);
    }
}

async function testPolymarket() {
    console.log('\n--- TESTING POLYMARKET ---');

    // Test 'q' (Query) instead of tag
    const params = new URLSearchParams({
        limit: "5",
        active: "true",
        closed: "false",
        q: "Middle East"
    });

    const url = `${GAMMA_API}?${params.toString()}`;
    console.log(`Query: ${url}`);

    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status}`);
        const data = await res.json();

        if (Array.isArray(data)) {
            console.log(`Found ${data.length} markets for "Israel".`);
            if (data.length > 0) {
                console.log(`Top: ${data[0].question}`);
                console.log(`Outcomes: ${data[0].outcomes}`);
                console.log(`Prices: ${data[0].outcomePrices}`);
            }
        } else {
            console.log('Response NOT an array:', JSON.stringify(data).substring(0, 100));
        }

    } catch (e) {
        console.error('Polymarket Error:', e);
    }
}

async function run() {
    await testOpenSky();
    await testPolymarket();
}

run();
