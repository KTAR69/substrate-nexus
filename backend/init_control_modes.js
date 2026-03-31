require('dotenv').config({ path: '../.env' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const agents = [
    {
        did: 'did:key:z6MkpJDdfoNfdkL8TECYLRFuQyHAVVsgHGPDBWe211dcSTuX',
        name: 'Giga',
        control_mode: 'player',  // Default: Player controlled
        description: 'Web3 Podcast Journalist - Player controlled by default'
    },
    {
        did: 'did:key:z6MkrWdFR9FLW4FPPvNYVxGhxD7Ey3Ey3Ey3Ey3Ey3Ey3Ey',
        name: 'Byte',
        control_mode: 'ai',  // Default: AI assisted
        description: 'Web3 Podcast Journalist - AI assisted by default'
    },
    {
        did: 'did:key:z6MkfwXVLSVYHN8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Y',
        name: 'Jules',
        control_mode: 'ai',  // Always AI
        description: 'AI Assistant - Always AI controlled'
    },
    {
        did: 'did:key:z6MkoXVLSVYHN8YxGhxD7Ey3Ey3Ey3Ey3Ey3Ey3Ey3Ey3Ey',
        name: 'OffRoadSDV',
        control_mode: 'ai',  // Always AI
        description: 'AI-Software Defined Vehicle - Always AI controlled'
    }
];

async function initControlModes() {
    console.log('[INIT] Initializing agent control modes...\n');
    
    for (const agent of agents) {
        try {
            await db.collection('metabolic_state').doc(agent.did).set({
                agent_did: agent.did,
                agent_name: agent.name,
                control_mode: agent.control_mode,
                description: agent.description,
                battery: 100,
                status: 'initialized',
                location: { x: 0, y: 0, z: 0 },
                initialized_at: admin.firestore.FieldValue.serverTimestamp(),
                last_updated: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            const modeIcon = agent.control_mode === 'player' ? '🎮' : '🤖';
            console.log(`✅ ${agent.name}: ${modeIcon} ${agent.control_mode.toUpperCase()} mode`);
            
        } catch (error) {
            console.error(`❌ Error initializing ${agent.name}:`, error.message);
        }
    }
    
    console.log('\n[SUCCESS] All agent control modes initialized!');
    console.log('\nControl Mode Summary:');
    console.log('  🎮 Giga: PLAYER mode (can switch to AI)');
    console.log('  🤖 Byte: AI mode (can switch to PLAYER)');
    console.log('  🤖 Jules: AI mode (always AI)');
    console.log('  🤖 OffRoadSDV: AI mode (always AI)');
    console.log('\nTo switch modes, update the control_mode field in Firestore metabolic_state collection.');
}

initControlModes()
    .then(() => {
        console.log('\n[DONE] Exiting...');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n[ERROR] Initialization failed:', error);
        process.exit(1);
    });

// Made with Bob
