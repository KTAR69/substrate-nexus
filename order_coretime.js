const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

async function main() {
    // Connect to Paseo Relay Chain
    const provider = new WsProvider('wss://paseo.rpc.amforc.com');
    const api = await ApiPromise.create({ provider });

    // Load Alice account
    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri('//Alice');

    const paraId = 5126;
    const maxAmount = 1_000_000_000_000n; // 1 PAS (10^12 Planck)

    console.log(`Connected to Paseo. Placing Coretime Order for ParaID ${paraId}...`);

    // Execute placeOrderAllowDeath
    // Note: The pallet name might vary depending on the runtime version.
    // We try 'onDemand' as requested.
    try {
        const tx = api.tx.onDemand.placeOrderAllowDeath(maxAmount, paraId);

        const unsub = await tx.signAndSend(alice, ({ status, events, dispatchError }) => {
            if (status.isInBlock) {
                console.log(`Transaction included in block: ${status.asInBlock}`);

                if (dispatchError) {
                    if (dispatchError.isModule) {
                        const decoded = api.registry.findMetaError(dispatchError.asModule);
                        const { docs, name, section } = decoded;
                        console.error(`Dispatch Error: ${section}.${name}: ${docs.join(' ')}`);
                    } else {
                        console.error(`Dispatch Error: ${dispatchError.toString()}`);
                    }
                    process.exit(1);
                } else {
                    console.log(`\nSUCCESS: Coretime Ordered for ParaID ${paraId}\n`);
                    console.log(`ARTIFACT_CORETIME_ORDER: CONFIRMED`);
                    unsub();
                    process.exit(0);
                }
            }
        });
    } catch (error) {
        console.error("Failed to place order:", error);
        process.exit(1);
    }
}

main().catch(console.error);
