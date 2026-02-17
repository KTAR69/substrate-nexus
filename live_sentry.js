const { ApiPromise, WsProvider } = require('@polkadot/api');
const { u8aToString } = require('@polkadot/util');

async function main() {
    const provider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({ provider });

    console.log('🚀 TEXAS ROOT DASHBOARD: Active');
    console.log('📡 Watching for DePIN Sensory Data...');

    api.query.system.events((events) => {
        events.forEach(async (record) => {
            const { event } = record;
            
            if (event.section === 'depinDesci') {
                const [who, dataLen] = event.data;
                console.log(`\n──────────────────────────────────────`);
                console.log(`🔥 EVENT: ${event.method}`);
                console.log(`👤 SENDER: ${who.toString()}`);
                console.log(`📏 PAYLOAD SIZE: ${dataLen} bytes`);

                // Optional: Query the storage immediately to see the latest reading
                const reading = await api.query.depinDesci.sensoryReadings(who);
                if (reading.isSome) {
                    const data = reading.toHuman();
                    console.log(`🌡️  DATA: Device [${data.device_id}] reported ${data.value}°C`);
                }
                console.log(`──────────────────────────────────────`);
            }
        });
    });
}

main().catch(console.error);