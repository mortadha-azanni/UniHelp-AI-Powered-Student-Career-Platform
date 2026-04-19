import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const keys = [
    { name: 'GOOGLE_API_KEY', value: process.env.GOOGLE_API_KEY },
    { name: 'GOOGLE_API_KEY_BACKUP', value: process.env.GOOGLE_API_KEY_BACKUP }
];

const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-latest',
    'gemini-2.5-flash'
];

async function testKey(keyObj) {
    console.log(`\n--- Testing ${keyObj.name} ---`);
    if (!keyObj.value) {
        console.log('❌ Key is missing');
        return;
    }

    const genAI = new GoogleGenerativeAI(keyObj.value);

    try {
        console.log('Listing available models...');
        // Note: listModels is not directly on genAI in the latest SDK version sometimes
        // It might be on a different sub-property or require a different approach
        // Let's try the common way
        const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyObj.value}`);
        const data = await result.json();
        
        if (data.error) {
            console.log(`❌ Error listing models: ${data.error.message}`);
        } else if (data.models) {
            console.log(`✅ Found ${data.models.length} models.`);
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`   - ${m.name} (${m.displayName})`);
                }
            });
        }
    } catch (err) {
        console.log(`❌ Failed to list models: ${err.message}`);
    }

    for (const modelName of modelsToTest) {
        try {
            console.log(`Testing model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'Hello'");
            const response = await result.response;
            const text = response.text();
            console.log(`✅ Success with ${modelName}: "${text.trim()}"`);
        } catch (error) {
            console.log(`❌ Failed with ${modelName}:`);
            if (error.status === 429) {
                console.log('   - Quota Exceeded (429)');
            } else if (error.status === 404) {
                console.log('   - Model Not Found (404)');
            } else if (error.status === 401) {
                console.log('   - Invalid API Key (401)');
            } else {
                console.log(`   - Error: ${error.message}`);
            }
        }
    }
}

async function runTests() {
    for (const key of keys) {
        await testKey(key);
    }
}

runTests().catch(console.error);
