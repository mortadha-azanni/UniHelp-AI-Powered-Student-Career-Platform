import dotenv from 'dotenv';
dotenv.config();

import { generateRoadmapContent } from './services/roadmapGeneratorChain.js';

console.log('Testing roadmap generation...');
console.log('GOOGLE_API_KEY set:', !!process.env.GOOGLE_API_KEY);
console.log('GOOGLE_API_KEY_BACKUP set:', !!process.env.GOOGLE_API_KEY_BACKUP);
console.log('OPENROUTER_API_KEY set:', !!process.env.OPENROUTER_API_KEY);
console.log('---');

try {
    const result = await generateRoadmapContent({
        goal: 'Penetration Testing',
        profile: { level: 'beginner', skills: [] }
    });
    console.log('SUCCESS! Title:', result.title);
    console.log('Nodes:', result.nodes?.length);
} catch (err) {
    console.error('FAILED:', err.message);
    if (err.cause) console.error('Cause:', err.cause);
}
