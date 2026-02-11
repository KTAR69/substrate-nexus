require('dotenv').config({ path: '../.env' });
const { consultingFlow } = require('./index');

async function simulateGatekeeper() {
    console.log('--- AI GATEKEEPER SIMULATION ---');

    const mockConsultant = {
        accountId: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', // Alice
        githubUrl: 'https://github.com/substrate-dev',
    };

    console.log(`Starting AI Verification for ${mockConsultant.accountId}...`);

    try {
        const result = await consultingFlow(mockConsultant);
        console.log('--- VERIFICATION RESULT ---');
        console.log(JSON.stringify(result, null, 2));
        console.log('--- END SIMULATION ---');
        process.exit(0);
    } catch (err) {
        console.error('Simulation Failed:', err.message);
        process.exit(1);
    }
}

simulateGatekeeper();
