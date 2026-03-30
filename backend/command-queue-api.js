const express = require('express');
const admin = require('firebase-admin');

// Initialize Firebase Admin with Default Credentials
// (Requires: gcloud auth application-default login)
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();
const app = express();
const port = 3001; // Using 3001 to avoid EADDRINUSE on 3000

app.get('/api/poll-command-queue', async (req, res) => {
    const { did } = req.query;

    if (!did) {
        console.log("❌ Request received but no DID provided.");
        return res.status(400).json({ error: 'Missing DID' });
    }

    console.log(`🔍 Polling for agent: ${did}`);

    try {
        // Query matching your screenshot: agent_did and pending status
        const snapshot = await db.collection('command_queue')
            .where('agent_did', '==', did)
            .where('status', '==', 'pending')
            .limit(1)
            .get();

        if (snapshot.empty) {
    return res.json({ command: "IDLE" }); // Changed from null to "IDLE"
}

        const doc = snapshot.docs[0];
        const data = doc.data();

        console.log(`🚀 Found Command! Action: ${data.action}`);

        // Update status so she doesn't repeat the command
        await doc.ref.update({ status: 'delivered' });

        // UE5 Blueprint expects "command", so we map your "action" field here
        res.json({ 
            command: data.action,
            agent_did: data.agent_did
        });

    } catch (error) {
        console.error('❌ Firestore Query Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`✅ Command Queue API listening on port ${port}`);
    console.log(`🔗 Map this port in Unreal: http://localhost:${port}/api/poll-command-queue?did=`);
});