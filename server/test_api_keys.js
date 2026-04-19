import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // Required for fetch if Node < 18
dotenv.config();

const keys = [
    { name: 'GOOGLE_API_KEY', value: process.env.GOOGLE_API_KEY },
    { name: 'GOOGLE_API_KEY_BACKUP', value: process.env.GOOGLE_API_KEY_BACKUP }
];

async function testKey(keyObj) {
    console.log(`\n==================================================`);
    console.log(`🔍 TESTING KEY: ${keyObj.name}`);
    console.log(`==================================================`);
    
    if (!keyObj.value) {
        console.log('❌ Error: Key is missing in .env file.');
        return;
    }

    // 1. Check Model Listing (Verifies key validity and available models)
    console.log('\n--- Step 1: Listing Available Models ---');
    let availableModels = [];
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${keyObj.value}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            console.log(`❌ Error: ${data.error.message}`);
            if (data.error.message.includes('leaked')) {
                console.log('⚠️  ALERT: This key is compromised and has been disabled by Google.');
            }
            return;
        }

        if (data.models) {
            console.log(`✅ Success! Found ${data.models.length} models.`);
            availableModels = data.models
                .filter(m => m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name.replace('models/', ''));
            
            console.log('\nTop models available for generation:');
            availableModels.slice(0, 15).forEach(m => console.log(`   - ${m}`));
            if (availableModels.length > 15) console.log(`   ... and ${availableModels.length - 15} more.`);
        }
    } catch (err) {
        console.log(`❌ Failed to list models: ${err.message}`);
        return;
    }

    // 2. Test Generation with a few models
    console.log('\n--- Step 2: Testing Generation ---');
    const genAI = new GoogleGenerativeAI(keyObj.value);
    
    // Pick models to test: preferred ones if available, otherwise first 3
    const preferredModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-pro-latest'];
    const modelsToTest = availableModels.filter(m => preferredModels.includes(m));
    if (modelsToTest.length === 0) modelsToTest.push(...availableModels.slice(0, 3));

    for (const modelName of modelsToTest) {
        try {
            process.stdout.write(`Testing [${modelName}]... `);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'Ready'");
            const text = (await result.response).text().trim();
            console.log(`✅ [${text}]`);
        } catch (error) {
            console.log(`❌ Error: ${error.message.split('\n')[0]}`);
        }
    }
}

async function run() {
    console.log('🚀 Starting Gemini API Key Diagnostics');
    for (const key of keys) {
        await testKey(key);
    }
}

run().catch(err => console.error('\n💥 Critical failure:', err));
