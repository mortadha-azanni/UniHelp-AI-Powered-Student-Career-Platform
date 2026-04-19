import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
dotenv.config();

const keys = [
    { name: 'GOOGLE_API_KEY (active)', key: process.env.GOOGLE_API_KEY },
    { name: 'Backup Google key', key: 'AIzaSyDoCddE99eeZl4iVn5RU6-oa15fTWqDWyk' },
];

const models = [
    'gemini-3.0-flash',
    'gemini-3.0-flash-lite',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-preview-04-17',
    'gemini-2.5-pro-preview-03-25',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
];

async function testModel(apiKey, modelName) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'Say OK' }] }] })
        });
        const data = await res.json();
        if (res.ok) return { status: 'WORKS', response: data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() };
        return {
            status: res.status === 429 ? 'QUOTA_EXCEEDED' : res.status === 404 ? 'NOT_FOUND' : 'ERROR',
            code: res.status, error: data.error?.status, message: data.error?.message?.split('\n')[0]
        };
    } catch (e) {
        return { status: 'NETWORK_ERROR', message: e.message };
    }
}

const results = { keys: [], openrouter: null };

for (const { name, key } of keys) {
    if (!key) { results.keys.push({ name, error: 'NOT_SET' }); continue; }
    const keyResult = { name, key: `${key.substring(0, 10)}...${key.slice(-4)}`, models: {} };
    for (const model of models) {
        keyResult.models[model] = await testModel(key, model);
        await new Promise(r => setTimeout(r, 400));
    }
    results.keys.push(keyResult);
}

// OpenRouter
const orKey = process.env.OPENROUTER_API_KEY;
if (orKey) {
    try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${orKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'openai/gpt-4o-mini', messages: [{ role: 'user', content: 'Say OK' }] })
        });
        const data = await res.json();
        results.openrouter = res.ok
            ? { status: 'WORKS', response: data.choices?.[0]?.message?.content?.trim() }
            : { status: 'ERROR', code: res.status, message: data.error?.message };
    } catch (e) {
        results.openrouter = { status: 'NETWORK_ERROR', message: e.message };
    }
}

writeFileSync('test_results.json', JSON.stringify(results, null, 2));
console.log('Done. Results written to test_results.json');
