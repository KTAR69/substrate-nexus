require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

async function listModels() {
    try {
        const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy call to trigger auth check if needed
        // The actual way to list models with the SDK is via the client:
        // But we can just try a different model name if we suspect it.
        console.log('Testing gemini-1.5-flash...');
        const chat = result.startChat();
        const response = await chat.sendMessage('Hi');
        console.log(response.response.text());
    } catch (err) {
        console.error('Error:', err.message);
    }
}

listModels().catch(console.error);
