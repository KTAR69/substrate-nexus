const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

async function main() {
    // Connect to Paseo
    const provider = new WsProvider('wss://paseo.rpc.amforc.com');
    const api = await ApiPromise.create({ provider });

    // Load Alice
    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri('//Alice');

    console.log('Connected to Paseo. Reserving ParaID...');

    // Sign and send reservation extrinsic
    const unsub = await api.tx.registrar.reserve()
        .signAndSend(alice, ({ status, events }) => {
            if (status.isInBlock) {
                console.log(`Transaction included in block: ${status.asInBlock}`);

                events.forEach(({ event: { data, method, section } }) => {
                    if (section === 'registrar' && method === 'Reserved') {
                        const paraId = data[0].toString();
                        console.log(`\nSUCCESS: ParaID Reserved: ${paraId}\n`);
                        console.log(`ARTIFACT_PARA_ID:${paraId}`);
                        unsub();
                        process.exit(0);
                    }
                });
            }
        });
}

main().catch(console.error);
