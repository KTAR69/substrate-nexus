const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

async function main() {
    await cryptoWaitReady();
    const keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
    const alice = keyring.addFromUri('//Alice');
    console.log(`SS58 Address: ${alice.address}`);
}

main().catch(console.error);
