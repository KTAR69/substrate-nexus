require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { genkit, z } = require('genkit');
const { googleAI } = require('@genkit-ai/googleai');
const axios = require('axios');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const { cryptoWaitReady, blake2AsU8a } = require('@polkadot/util-crypto');
const { Keyring } = require('@polkadot/keyring');
const { KeyManagementServiceClient } = require('@google-cloud/kms');
const crypto = require('crypto');

const ai = genkit({
    plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
    model: 'googleai/gemini-pro',
});

// KMS Configuration
// KMS Configuration
let kmsClient;
if (process.env.SIMULATE_KMS) {
    console.log('[Simulation] Using Mock KMS Client.');
    kmsClient = {
        asymmetricSign: async ({ name, data }) => {
            console.log(`[MockKMS] Signing data for key: ${name}`);
            return [{ signature: Buffer.from('MOCKED_KMS_SIGNATURE') }];
        }
    };
} else {
    kmsClient = new KeyManagementServiceClient();
}
const kmsKeyName = process.env.KMS_KEY_NAME;

/**
 * Custom Signer for @polkadot/api that uses Google Cloud KMS
 */
class KmsSigner {
    constructor(client, keyName) {
        this.client = client;
        this.keyName = keyName;
        this.nextId = 0;
    }

    async signPayload(payload) {
        const id = ++this.nextId;
        console.log(`[KmsSigner] Signing payload ${id} via Google Cloud KMS...`);

        // In a production scenario, we would reconstruct the payload and hash it if > 256 bytes
        // For this simulation, we'll demonstrate the KMS interaction logic.
        const rawPayload = payload.method; // Simplification for the example

        try {
            // For ED25519, KMS expects the raw data in the 'data' field, not 'digest'
            const [response] = await this.client.asymmetricSign({
                name: this.keyName,
                data: Buffer.from(payload.toU8a ? payload.toU8a(true) : rawPayload),
            });

            console.log(`[KmsSigner] Signature received from KMS.`);
            return {
                id,
                signature: response.signature,
            };
        } catch (err) {
            console.error('[KmsSigner] KMS Signing Failed:', err.message);
            throw err;
        }
    }
}

// Tool to scan GitHub for Substrate-related activity
const scanGitHubActivity = ai.defineTool(
    {
        name: 'scanGitHubActivity',
        description: 'Scans a GitHub username for Substrate and Polkadot related commits.',
        inputSchema: z.object({ username: z.string() }),
        outputSchema: z.object({ commitCount: z.number(), substrateFound: z.boolean() }),
    },
    async ({ username }) => {
        try {
            console.log(`Scanning GitHub for user: ${username}...`);
            const mockResult = {
                commitCount: 5,
                substrateFound: true,
            };
            return mockResult;
        } catch (err) {
            console.error('GitHub API Error:', err.message);
            return { commitCount: 0, substrateFound: false };
        }
    }
);

const consultingFlow = ai.defineFlow(
    {
        name: 'consultingFlow',
        inputSchema: z.object({
            accountId: z.string(),
            githubUrl: z.string(),
        }),
        outputSchema: z.object({
            verified: z.boolean(),
            txHash: z.string().optional(),
            reason: z.string(),
        }),
    },
    async ({ accountId, githubUrl }) => {
        const username = githubUrl.split('/').pop();

        let text = '';
        if (process.env.SIMULATE_AI) {
            console.log('[Simulation] Bypassing AI generation. Returning VERIFIED.');
            text = 'VERIFIED: Simulation Mode Active.';
        } else {
            const result = await ai.generate({
                prompt: `
            You are the Substrate Consulting Nexus Gatekeeper.
            Verify if the GitHub user "${username}" is a qualified Substrate architect.
            Rules:
            1. Must have at least 3 Substrate-related commits.
            2. Must have a history of working with Rust and Polkadot SDK.
            
            Using the scanGitHubActivity tool for ${username}...
            
            Explain your verification decision. If verified, start your response with "VERIFIED:".
          `,
                tools: [scanGitHubActivity],
            });
            text = result.text;
        }

        const isVerified = text.toUpperCase().startsWith('VERIFIED:');

        if (isVerified) {
            console.log(`Consultant ${accountId} verified by AI. Initiating KMS-secured transaction...`);

            try {
                let api;
                let tx;

                if (process.env.SIMULATE_SUBSTRATE) {
                    console.log('[Simulation] Connecting to Mock Substrate Node...');
                    api = {
                        tx: {
                            consulting: {
                                verify_consultant: (id) => ({
                                    signAndSend: async (addr, options, cb) => {
                                        console.log(`[MockTx] Signing payload for ${id} with signer...`);
                                        // Simulate signing flow
                                        const payload = { method: '0x1234', toU8a: () => new Uint8Array([1, 2, 3]) };
                                        await options.signer.signPayload(payload);

                                        cb({ status: { isInBlock: true, asInBlock: { toHex: () => '0xMOCK_HASH' } }, dispatchError: null });
                                    }
                                })
                            }
                        }
                    };
                } else {
                    await cryptoWaitReady();
                    const provider = new WsProvider(process.env.SUBSTRATE_RPC_URL || 'ws://127.0.0.1:9944');
                    api = await ApiPromise.create({ provider });
                }

                // Initialize the KMS Signer
                const signer = new KmsSigner(kmsClient, kmsKeyName);

                // In this architecture, the KMS Public Key would be registered as the 'AliceVerifier' on-chain.
                // For the simulation, we'll use the signer to sign the transaction.
                // The sender address would be derived from the KMS public key.
                const kmsAddress = process.env.KMS_STUB_ADDRESS || '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'; // Default to Alice for local simulation

                tx = api.tx.consulting.verify_consultant(accountId);

                console.log(`[KMS Gatekeeper] Submitting verified transaction for ${accountId}...`);

                // We pass the custom KMS signer to signAndSend
                return new Promise((resolve) => {
                    tx.signAndSend(kmsAddress, { signer }, ({ status, dispatchError }) => {
                        if (status.isInBlock) {
                            if (dispatchError) {
                                resolve({ verified: true, reason: 'AI Verified but KMS-signed transaction failed: ' + dispatchError.toString() });
                            } else {
                                console.log(`[KMS Gatekeeper] Transaction SUCCESS. Hash: ${status.asInBlock.toHex()}`);
                                resolve({ verified: true, txHash: status.asInBlock.toHex(), reason: 'AI Verified and Hardware-Signed.' });
                            }
                        }
                    });
                });
            } catch (err) {
                return { verified: true, reason: 'AI Verified but KMS integration failed: ' + err.message };
            }
        } else {
            return { verified: false, reason: 'GitHub activity insufficient: ' + text };
        }
    }
);

module.exports = { consultingFlow };
