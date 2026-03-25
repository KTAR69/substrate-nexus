import * as mqtt from 'mqtt';

const client = mqtt.connect('mqtt://127.0.0.1:1883');

client.on('connect', () => {
    console.log('Connected to broker. Listening to guardian/heartbeat...');
    client.subscribe('guardian/heartbeat');
});

client.on('message', (topic, message) => {
    console.log(`[${topic}] ${message.toString()}`);
});
