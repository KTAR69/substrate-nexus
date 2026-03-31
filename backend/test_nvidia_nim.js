require('dotenv').config({ path: '../.env' });
const axios = require('axios');

async function testNvidiaAPI() {
    console.log('🧪 Testing NVIDIA NIM API Connection...\n');
    
    const apiKey = process.env.NVIDIA_NIM_API_KEY;
    const endpoint = process.env.NVIDIA_NIM_ENDPOINT;
    const model = process.env.NVIDIA_NIM_MODEL;
    
    if (!apiKey) {
        console.error('❌ NVIDIA_NIM_API_KEY not found in environment');
        process.exit(1);
    }
    
    console.log('✅ API Key loaded:', apiKey.substring(0, 20) + '...');
    console.log('✅ Endpoint:', endpoint);
    console.log('✅ Model:', model);
    console.log('\n📡 Sending test request...\n');
    
    try {
        const response = await axios.post(
            `${endpoint}/chat/completions`,
            {
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI agent coordinator for a decentralized network.'
                    },
                    {
                        role: 'user',
                        content: 'Agent Byte reports: Location (100, 200, 50), Battery 85%, Status Operational. What command should I give?'
                    }
                ],
                temperature: 0.7,
                max_tokens: 150
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ SUCCESS! NVIDIA NIM API is working!\n');
        console.log('📊 Response Details:');
        console.log('   Model:', response.data.model);
        console.log('   Tokens Used:', response.data.usage?.total_tokens || 'N/A');
        console.log('   Finish Reason:', response.data.choices[0]?.finish_reason || 'N/A');
        console.log('\n💬 AI Response:');
        console.log('   ', response.data.choices[0]?.message?.content || 'No response');
        console.log('\n🎉 NVIDIA NIM integration is ready for Phase 1!');
        
    } catch (error) {
        console.error('❌ NVIDIA NIM API Error:\n');
        
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Status Text:', error.response.statusText);
            console.error('   Error Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('   No response received from server');
            console.error('   Request:', error.message);
        } else {
            console.error('   Error:', error.message);
        }
        
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check API key is valid');
        console.error('   2. Verify endpoint URL is correct');
        console.error('   3. Ensure model name is supported');
        console.error('   4. Check network connectivity');
        
        process.exit(1);
    }
}

testNvidiaAPI();

// Made with Bob
