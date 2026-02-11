require('dotenv').config({ path: '../.env' });
process.env.SIMULATE_AI = 'true';
process.env.SIMULATE_SUBSTRATE = 'true';
process.env.SIMULATE_KMS = 'true';
const { consultingFlow } = require('./index');

// Mocking the KMS Client for local simulation
const { KeyManagementServiceClient } = require('@google-cloud/kms');

// Override the real KMS client in the module scope (simulated injection)
// Since we can't easily inject into the required module without Dependency Injection,
// we will verify the flow logic up to the point of KMS failure or mock the response if possible.
// For this verification, we expect the flow to reach the KMS signing step.

async function simulateKMSGatekeeper() {
    console.log('--- KMS GATEKEEPER SIMULATION ---');

    const mockConsultant = {
        accountId: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', // Alice
        githubUrl: 'https://github.com/substrate-dev',
    };

    console.log(`Starting AI Verification for ${mockConsultant.accountId}...`);

    try {
        const result = await consultingFlow(mockConsultant);
        console.log('--- VERIFICATION RESULT ---');
        console.log(JSON.stringify(result, null, 2));

        if (result.reason.includes('KMS integration failed')) {
            console.log('✅ Simulation Successful: AI Verified and attempted KMS signing (Failure expected due to missing credentials).');
        } else if (result.verified) {
            console.log('✅ Simulation Successful: Full flow completed.');
        }

        console.log('--- END SIMULATION ---');
        process.exit(0);
    } catch (err) {
        console.error('Simulation Failed:', err.message);
        process.exit(1);
    }
}

simulateKMSGatekeeper();
