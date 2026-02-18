const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main() {
    const provider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({ provider });

    // This pulls all events from the most recent block
    const events = await api.query.system.events();
    
    console.log(`✨ Found ${events.length} events in the current block.`);
    
    events.forEach((record) => {
        const { event, phase } = record;
        const types = event.typeDef;
        console.log(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`);
        event.data.forEach((data, index) => {
            console.log(`\t\t${types[index].type}: ${data.toString()}`);
        });
    });

    process.exit(0);
}

main().catch(console.error);
