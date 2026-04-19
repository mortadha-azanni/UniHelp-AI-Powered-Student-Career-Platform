import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

async function listModels() {
    console.log('Listing available models...');
    const models = await ai.models.list();
    for await (const model of models) {
        if (model.supportedActions?.includes('generateContent')) {
            console.log(`✅ ${model.name} | ${model.displayName}`);
        }
    }
}

listModels().catch(console.error);
