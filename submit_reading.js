const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

async function main() {
    const provider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({ provider });
    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri('//Alice');

    console.log('📡 Submitting DePIN reading from Texas Root...');

    // Mapping to the verified submitSensoryData extrinsic
    const tx = api.tx.depinDesci.submitSensoryData({
        device_id: 'TX-ROOT-001',
        reading_type: 'Temperature',
        value: 78 // Current local reading
    });

    const hash = await tx.signAndSend(alice);
    console.log('✅ Transaction Successful. Hash:', hash.toHex());
    
    process.exit(0);
}

main().catch(console.error);
