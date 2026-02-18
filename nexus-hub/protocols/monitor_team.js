const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main() {
    const provider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({ provider });

    console.log("👀 Monitoring Rovr Team Activity...");
    console.log("------------------------------------------------");

    api.query.system.events((events) => {
        events.forEach((record) => {
            const { event } = record;
            // Filter for Balance Transfers
            if (event.section === 'balances' && event.method === 'Transfer') {
                const [from, to, amount] = event.data;
                console.log(`💰 Money Move: ${from} -> ${to} (${amount} units)`);
            }
            // Filter for Sensory Data
            if (event.section === 'depinDesci' && event.method === 'SensoryDataStored') {
                console.log(`🦖 DATA INGEST: New Sensory Data on Chain!`);
            }
        });
    });
}
main().catch(console.error);
