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
    { name: 'Jules', uri: '//NexusHub//Jules', role: 'physical_dpai' },
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

// Phase 3: Logging Helper Functions
function logHeader(message) {
    console.log(`=== ${message} ===\n`);
}

function logAgentHeader(name) {
    console.log(`--- ${name} ---`);
}

function logStep(step, total, message) {
    console.log(`  [${step}/${total}] ${message}`);
}

function logInfo(label, value, indent = '  ') {
    console.log(`${indent}${label.padEnd(13)}: ${value}`);
}

// Phase 4: Registration Steps Configuration
const REGISTRATION_STEPS = [
    {
        name: 'Funding from Alice...',
        execute: async (api, agent, pair, alice) => {
            await sendAndWait(api.tx.balances.transferKeepAlive(agent.ss58, FUND_AMOUNT), alice);
        }
    },
    {
        name: 'register_consultant...',
        execute: async (api, agent, pair) => {
            await sendAndWait(api.tx.consulting.registerConsultant(agent.name), pair);
        }
    },
    {
        name: 'verify_consultant...',
        execute: async (api, agent, pair, alice) => {
            await sendAndWait(api.tx.consulting.verifyConsultant(agent.ss58), alice);
        }
    }
];

const TOTAL_STEPS = REGISTRATION_STEPS.length;

// Phase 4: Extract Agent Registration Logic
async function registerAgent(api, agent, ed25519Keyring, alice) {
    logAgentHeader(agent.name);
    
    const pair = ed25519Keyring.addFromUri(agent.uri);
    const ss58 = pair.address;
    const didKey = pubkeyToDidKey(pair.publicKey);

    logInfo('SS58 Address', ss58);
    logInfo('DID Key', didKey);

    const agentData = { name: agent.name, ss58, didKey };

    for (let i = 0; i < TOTAL_STEPS; i++) {
        const step = REGISTRATION_STEPS[i];
        logStep(i + 1, TOTAL_STEPS, step.name);
        await step.execute(api, agentData, pair, alice);
    }

    console.log(`  DONE: ${agent.name} registered and verified\n`);
    return agentData;
}

// Phase 5: Validation Function
function validateEnvironment() {
    if (!AGENTS || AGENTS.length === 0) {
        throw new Error('No agents configured for registration');
    }
    
    for (const agent of AGENTS) {
        if (!agent.name || !agent.uri) {
            throw new Error(`Invalid agent configuration: ${JSON.stringify(agent)}`);
        }
    }
}

// Phase 5: Display Helper Functions
function displayDidKeys(results) {
    console.log('Update UE5 Blueprint parties[0].did with these values:\n');
    for (const r of results) {
        console.log(`  ${r.name.padEnd(12)} ->  ${r.didKey}`);
    }
}

function displaySS58Addresses(results) {
    console.log('\nSubstrate SS58 addresses:');
    for (const r of results) {
        console.log(`  ${r.name.padEnd(12)} ->  ${r.ss58}`);
    }
}

function displayResults(results) {
    console.log('\n');
    logHeader('REGISTRATION COMPLETE');
    displayDidKeys(results);
    displaySS58Addresses(results);
}

async function main() {
    // Phase 5: Validate environment before starting
    validateEnvironment();

    logHeader('NexusHub_TexasRoot — Agent Registration');
    await cryptoWaitReady();

    console.log(`Connecting to ${WS_URL}...`);
    const provider = new WsProvider(WS_URL);
    const api = await ApiPromise.create({ provider });

    try {
        const chain = (await api.rpc.system.chain()).toString();
        console.log(`Connected -> Chain: ${chain}\n`);

        const srKeyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
        const alice = srKeyring.addFromUri('//Alice');
        logInfo('Alice (Verifier/Funder)', alice.address);
        console.log();

        const ed25519Keyring = new Keyring({ type: 'ed25519', ss58Format: 42 });
        const results = [];

        // Phase 4: Simplified main loop using extracted function
        for (const agent of AGENTS) {
            const result = await registerAgent(api, agent, ed25519Keyring, alice);
            results.push(result);
        }

        // Phase 5: Use display helper
        displayResults(results);

        process.exit(0);
    } catch (error) {
        console.error('\nRegistration failed:', error.message);
        process.exit(1);
    } finally {
        await api.disconnect();
    }
}

main().catch(err => {
    console.error('\nRegistration failed:', err.message);
    process.exit(1);
});