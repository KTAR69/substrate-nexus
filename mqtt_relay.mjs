import { createServer } from 'http';
import * as mqtt from 'mqtt';
import { createClient } from 'redis';

const HTTP_PORT = 1884;
const MQTT_BROKER = 'mqtt://127.0.0.1:1883';
const REDIS_URL = 'redis://127.0.0.1:6379';

// Connect to the local MQTT broker
const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
    console.log(`[Relay] Connected to MQTT broker at ${MQTT_BROKER}`);
});

client.on('error', (err) => {
    console.error('[Relay] MQTT Connection Error:', err);
});

// Connect to the local Redis instance
const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => {
    console.error('[Relay] Redis Connection Error:', err);
});

async function connectRedis() {
    try {
        await redisClient.connect();
        console.log(`[Relay] Connected to Redis at ${REDIS_URL}`);
    } catch (err) {
        console.error('[Relay] Initial Redis connection failed:', err);
    }
}
connectRedis();

// Spin up the HTTP server to intercept Substrate offchain worker requests
const server = createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/relay') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const topic = payload.topic || 'guardian/heartbeat';

                // Publish to MQTT
                client.publish(topic, JSON.stringify(payload), { qos: 0 }, async (err) => {
                    if (err) {
                        console.error('[Relay] Failed to publish:', err);
                        res.writeHead(500);
                        res.end('Publish failed');
                    } else {
                        console.log(`[Relay] Forwarded to ${topic}:`, payload);

                        // Save latest block heartbeat to Redis Memory Layer
                        try {
                            if (redisClient.isReady) {
                                await redisClient.set('latest_block_heartbeat', JSON.stringify(payload));
                                console.log('[Relay] Redis updated: latest_block_heartbeat');
                            }
                        } catch (redisErr) {
                            console.error('[Relay] Failed to update Redis:', redisErr);
                        }

                        res.writeHead(200);
                        res.end('OK');
                    }
                });
            } catch (e) {
                console.error('[Relay] Failed to parse payload:', e);
                res.writeHead(400);
                res.end('Bad Request');
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(HTTP_PORT, () => {
    console.log(`[Relay] HTTP to MQTT bridge listening on port ${HTTP_PORT}`);
    console.log(`[Relay] Waiting for Substrate Offchain Worker POSTs...`);
});
