import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';

// Zod schema for structured interview output
const hrInterviewSchema = z.object({
    botMessage: z.string().describe("The message from the HR interviewer to the candidate."),
    feedback: z.string().describe("Constructive behavioral feedback on the candidate's previous response.").optional(),
    step: z.number().describe("The current step/index of the interview."),
    done: z.boolean().describe("Whether the interview is finished."),
    summary: z.object({
        communication: z.number().min(0).max(5).optional(),
        motivation: z.number().min(0).max(5).optional(),
        team_fit: z.number().min(0).max(5).optional(),
        adaptability: z.number().min(0).max(5).optional()
    }).describe("Evaluation scores (1-5) for behavioral traits if the interview is done.").optional(),
});

/**
 * Conduct a conversational HR/Behavioral interview using LangChain + Gemini.
 * 
 * @param {object} params
 * @param {object} params.profile - Candidate's complete profile
 * @param {string} params.message - Candidate's latest message
 * @param {number} params.step - Current interview step
 * @param {Array} params.history - Conversation history
 */
export async function hrInterviewChat({ profile, message, step, history = [] }) {
    const model = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash',
        apiKey: process.env.GOOGLE_API_KEY,
        temperature: 0.6,
    });

    const structuredModel = model.withStructuredOutput(hrInterviewSchema);

    // Minimal safe serialization of profile
    const profileSummary = {
        summary: profile.personalInfo?.summary || '',
        softSkills: profile.skills?.soft?.map(s => s.name).join(', ') || '',
        experience: profile.workExperience?.map(w => ({ role: w.position, duties: w.responsibilities })).slice(0, 2) || []
    };

    const prompt = `You are an expert HR Manager conducting a behavioral interview.

CANDIDATE PROFILE SUMMARY:
${JSON.stringify(profileSummary, null, 2)}

CONTEXT:
Current Step: ${step}
Candidate Message: "${message}"

INTERVIEW GUIDELINES:
1. Conduct a behavioral and cultural fit interview (communication, motivation, adaptability).
2. If this is the start (step=0, message="start"), greet the candidate warmly and ask a classic opening behavioral question (e.g., "Tell me about yourself" or "Describe a challenge you faced").
3. Be professional, welcoming, and encouraging.
4. For each response, provide brief, constructive feedback in the 'feedback' field focusing on soft skills.
5. Ask exactly one clear behavioral question per turn.
6. The interview should last about 5-7 steps.
7. If step >= 5, aim to wrap up the interview and set 'done' to true.
8. When 'done' is true, provide a 'summary' with scores from 1 to 5.

CONVERSATION HISTORY:
${history.map(h => `${h.type === 'bot' ? 'HR' : 'Candidate'}: ${h.message}`).join('\n')}

Return your response in the specified JSON format.`;

    const result = await structuredModel.invoke(prompt);
    return result;
}
