require('dotenv').config({ path: '../.env' });

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady, base58Encode } = require('@polkadot/util-crypto');

const WS_URL = process.env.SUBSTRATE_RPC_URL || 'ws://127.0.0.1:9944';
const FUND_AMOUNT = 1_000_000_000_000_000n;

function pubkeyToDidKey(pubkeyU8a) {
    const prefix = new Uint8Array([0xed, 0x01]);
    const combined = new Uint8Array(prefix.length + pubkeyU8a.length);
    combined.set(prefix);
    combined.set(pubkeyU8a, prefix.length);
    return `did:key:z${base58Encode(combined)}`;
}

const AGENTS = [
    { name: 'Byte', uri: '//NexusHub//Byte', role: 'physical_dpai' },
    { name: 'Giga', uri: '//NexusHub//Giga', role: 'physical_dpai' },
    { name: 'OffRoadSDV', uri: '//NexusHub//OffRoadSDV', role: 'sdv_node' },
];

function sendAndWait(tx, signer) {
    return new Promise((resolve, reject) => {
        let unsub;
        tx.signAndSend(signer, ({ status, dispatchError }) => {
            if (dispatchError) {
                const msg = dispatchError.isModule
                    ? dispatchError.asModule.toString()
                    : dispatchError.toString();
                if (unsub) unsub();
                reject(new Error(`Dispatch error: ${msg}`));
                return;
            }
            if (status.isInBlock) {
                console.log(`      Block: ${status.asInBlock.toHex()}`);
                if (unsub) unsub();
                resolve(status.asInBlock.toHex());
            }
        }).then(u => { unsub = u; }).catch(reject);
    });
}

async function main() {
    console.log('=== NexusHub_TexasRoot — Agent Registration ===\n');
    await cryptoWaitReady();

    console.log(`Connecting to ${WS_URL}...`);
    const provider = new WsProvider(WS_URL);
    const api = await ApiPromise.create({ provider });
    await api.isReady;

    const chain = (await api.rpc.system.chain()).toString();
    console.log(`Connected -> Chain: ${chain}\n`);

    const srKeyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
    const alice = srKeyring.addFromUri('//Alice');
    console.log(`Alice (Verifier/Funder): ${alice.address}\n`);

    const ed25519Keyring = new Keyring({ type: 'ed25519', ss58Format: 42 });
    const results = [];

    for (const agent of AGENTS) {
        console.log(`--- ${agent.name} ---`);
        const pair = ed25519Keyring.addFromUri(agent.uri);
        const ss58 = pair.address;
        const didKey = pubkeyToDidKey(pair.publicKey);

        console.log(`  SS58 Address : ${ss58}`);
        console.log(`  DID Key      : ${didKey}`);

        console.log(`  [1/3] Funding from Alice...`);
        await sendAndWait(api.tx.balances.transferKeepAlive(ss58, FUND_AMOUNT), alice);

        console.log(`  [2/3] register_consultant...`);
        await sendAndWait(api.tx.consulting.registerConsultant(agent.name), pair);

        console.log(`  [3/3] verify_consultant...`);
        await sendAndWait(api.tx.consulting.verifyConsultant(ss58), alice);

        console.log(`  DONE: ${agent.name} registered and verified\n`);
        results.push({ name: agent.name, ss58, didKey });
    }

    console.log('\n=== REGISTRATION COMPLETE ===\n');
    console.log('Update UE5 Blueprint parties[0].did with these values:\n');
    for (const r of results) {
        console.log(`  ${r.name.padEnd(12)} ->  ${r.didKey}`);
    }
    console.log('\nSubstrate SS58 addresses:');
    for (const r of results) {
        console.log(`  ${r.name.padEnd(12)} ->  ${r.ss58}`);
    }

    await api.disconnect();
    process.exit(0);
}

main().catch(err => {
    console.error('\nRegistration failed:', err.message);
    process.exit(1);
});