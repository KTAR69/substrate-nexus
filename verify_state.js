const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main() {
    const provider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({ provider });

    // The key is likely the AccountId of the sender (Alice)
    const aliceAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    console.log(`🔍 Fetching readings for Account: Alice (${aliceAddress})...`);

    try {
        // Querying the map using Alice's AccountId
        const reading = await api.query.depinDesci.sensoryReadings(aliceAddress);
        
        if (reading.isSome) {
            console.log('✅ Entry Found:');
            console.log(JSON.stringify(reading.toHuman(), null, 2));
        } else {
            console.log('❌ No entry found for this account. The pallet might use a different keying strategy.');
        }
    } catch (error) {
        console.error('❌ Query Failed:', error.message);
    }

    process.exit(0);
}

main().catch(console.error);