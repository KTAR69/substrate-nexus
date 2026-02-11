require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/googleai');

const ai = genkit({
    plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
    model: 'googleai/gemini-2.0-flash-exp',
});

async function runAudit() {
    const palletPath = path.join(__dirname, '../pallets/consulting/src/lib.rs');
    if (!fs.existsSync(palletPath)) {
        console.error('Pallet file not found at:', palletPath);
        return;
    }
    const palletCode = fs.readFileSync(palletPath, 'utf8');

    const prompt = `
    Analyze the following Substrate extrinsic for XCM security vulnerabilities. 
    1. Logic Check: If the origin is a Location (XCM) instead of a Signed (local) account, will the transaction fail or execute?
    2. Economic Risk: Calculate if a 'cheap' XCM message could fill the Consultants storage map, causing a State Bloat DoS.
    3. The Fix: Propose an XCM Barrier in Rust that filters for 'Trusted' parachain IDs only.
    
    Code:
    ${palletCode}
  `;

    try {
        const { text } = await ai.generate(prompt);
        console.log('--- AUDIT REPORT ---');
        console.log(text);
        console.log('--- END REPORT ---');
    } catch (err) {
        console.error('Genkit Error:', err.message);
        if (err.status) console.error('Status:', err.status);
        if (err.errorDetails) {
            console.error('Details:', JSON.stringify(err.errorDetails, null, 2));
        }
    }
}

runAudit().catch(console.error);
