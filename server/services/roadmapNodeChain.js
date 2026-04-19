import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';

const nodeGenerationSchema = z.object({
    description: z.string().describe("A professional and engaging 2-3 paragraph explanation of the topic, its importance, and what the user needs to learn. Markdown formatting is encouraged."),
    masteryLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Master']).describe("The candidate's estimated mastery level of this specific topic based on their profile and skills."),
    recommendedStatus: z.enum(['completed', 'in-progress', 'pending']).describe("Recommended node status: 'completed' if they are a 'Master', 'in-progress' if 'Intermediate/Advanced', 'pending' if 'Beginner'."),
    resources: z.array(
        z.object({
            title: z.string().describe("Title of the resource (e.g., Official Docs, YouTube Video)"),
            url: z.string().describe("URL to the resource"),
            type: z.enum(['article', 'video', 'documentation', 'github', 'other']).describe("Type of the resource")
        })
    ).describe("3 to 5 high-quality, real-world learning resources for this topic.")
});

/**
 * Serialize technical skills
 */
function serializeTechnicalSkills(technicalSkills) {
    const plain = (technicalSkills || []).map(s => ({
        name: s?.name || '',
        category: s?.category || 'Other',
        proficiency: s?.proficiency || 'Intermediate',
    }));
    return JSON.stringify(plain);
}

/**
 * Serialize experience
 */
function serializeExperience(workExperience) {
    const plain = (workExperience || []).map(w => ({
        title: w?.position || '',
        description: w?.responsibilities || ''
    }));
    return JSON.stringify(plain);
}

/**
 * Generate rich content for a learning node using LangChain + Gemini
 */
export async function generateRoadmapNodeContent({ roadmapTitle, nodeLabel, profile }) {
    if (!process.env.GOOGLE_API_KEY) {
        throw new Error("Missing GOOGLE_API_KEY in environment variables.");
    }

    const model = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash',
        apiKey: process.env.GOOGLE_API_KEY,
        temperature: 0.7,
    });

    const structuredModel = model.withStructuredOutput(nodeGenerationSchema);

    let profileContext = "User profile not available.";
    if (profile) {
        const skills = serializeTechnicalSkills(profile.skills?.technical);
        const experience = serializeExperience(profile.workExperience);
        profileContext = `
USER SKILLS:
${skills}

USER EXPERIENCE:
${experience}
`;
    }

    const prompt = `
You are an expert tech mentor building a learning roadmap.

ROADMAP CONTEXT:
Overall Roadmap Subject: "${roadmapTitle}"
Current Topic / Node to Explain: "${nodeLabel}"

${profileContext}

TASK:
1. Explain what "${nodeLabel}" is in the context of "${roadmapTitle}", why it's important, and the key concepts to master. Write 2-3 paragraphs.
2. Provide 3 to 5 highly relevant, real-world learning resources (links to official docs, reputable crash courses, articles).
3. Evaluate the USER SKILLS and USER EXPERIENCE provided above. 
   - If the user clearly already knows this topic (e.g., they have it in their skills or experience), mark their masteryLevel as "Master" and recommendedStatus as "completed".
   - If they have some exposure, mark "Intermediate" or "Advanced" and "in-progress".
   - If it's completely new to them, mark "Beginner" and "pending".

Return ONLY the requested JSON structure.
`;

    const result = await structuredModel.invoke(prompt);
    return result;
}
