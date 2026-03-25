import * as mqtt from 'mqtt';

const client = mqtt.connect('mqtt://127.0.0.1:1883');

client.on('connect', () => {
    console.log('Connected. Sending test heartbeat...');
    const payload = JSON.stringify({ block: 9999, topic: "guardian/heartbeat" });

    client.publish('guardian/heartbeat', payload, { qos: 0 }, (err) => {
        if (err) {
            console.error('Publish error:', err);
        } else {
            console.log('Sent:', payload);
        }
        client.end();
    });
});
