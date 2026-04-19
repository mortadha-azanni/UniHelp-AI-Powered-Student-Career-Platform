
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { StructuredOutputParser } from '@langchain/core/output_parsers';

import { z } from 'zod';


export async function draftApplicationEmail(cvSnapshot, jobDescription) {
    const model = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash', 
        apiKey: process.env.GOOGLE_API_KEY,
        temperature: 0.7,
    });

    // 1. Define the schema using Zod
    const parser = StructuredOutputParser.fromZodSchema(
        z.object({
            subject: z.string().describe("The email subject line"),
            body: z.string().describe("The professional email body text")
        })
    );

    const formatInstructions = parser.getFormatInstructions();

    const prompt = `
    You are an expert career coach and professional recruiter. Your task is to draft a highly personalized and compelling job application email.
    
    CONTEXT:
    - Candidate Name: ${cvSnapshot.personalInfo.fullName}
    - Target Job Description: ${jobDescription}
    
    ACHIEVEMENTS TO HIGHLIGHT (from CV):
    ${JSON.stringify(cvSnapshot.workExperience)}
    
    INSTRUCTIONS:
    1. The subject line should be catchy yet professional (e.g., "Application for [Position] - [Name]").
    2. The body should be concise, professional, and directly address the requirements in the job description.
    3. Use a tone that is confident but respectful.
    4. Highlight 2-3 specific achievements from the CV that directly map to the job requirements.
    5. Ensure the email looks like it was written by the candidate themselves, not an AI.
    
    ${formatInstructions}
    `;

    const response = await model.invoke([new HumanMessage(prompt)]);
    
    return await parser.parse(response.content);
}

