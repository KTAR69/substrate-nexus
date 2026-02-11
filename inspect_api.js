const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main() {
    const provider = new WsProvider('wss://paseo.rpc.amforc.com');
    const api = await ApiPromise.create({ provider });

    console.log('Connected to Paseo. Listing potentially relevant pallets...');

    const relevantKeywords = ['coretime', 'assignment', 'provider', 'ondemand', 'broker'];
    const pallets = Object.keys(api.tx).filter(name =>
        relevantKeywords.some(keyword => name.toLowerCase().includes(keyword))
    );

    console.log('Found likely candidates:', pallets);

    for (const pallet of pallets) {
        console.log(`\nPallet: ${pallet}`);
        const methods = Object.keys(api.tx[pallet]);
        console.log('Methods:', methods.join(', '));
    }

    process.exit(0);
}

main().catch(console.error);
