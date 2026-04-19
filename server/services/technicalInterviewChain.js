import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';

// Zod schema for structured interview output
const interviewSchema = z.object({
    botMessage: z.string().describe("The message from the AI interviewer to the candidate."),
    feedback: z.string().describe("Constructive feedback on the candidate's previous response.").optional(),
    step: z.number().describe("The current step/index of the interview."),
    done: z.boolean().describe("Whether the interview is finished."),
    summary: z.object({
        technical_accuracy: z.number().min(0).max(5).optional(),
        communication: z.number().min(0).max(5).optional(),
        problem_solving: z.number().min(0).max(5).optional(),
    }).describe("Evaluation scores (1-5) if the interview is done.").optional(),
});

/**
 * Serialize technical skills array into a compact string.
 */
function serializeTechnicalSkills(technicalSkills) {
    const plain = technicalSkills.map(s => ({
        name: s.name || '',
        category: s.category || 'Other',
        proficiency: s.proficiency || 'Intermediate',
    }));
    return JSON.stringify(plain);
}

/**
 * Conduct a conversational technical interview using LangChain + Gemini.
 * 
 * @param {object} params
 * @param {Array} params.technicalSkills - Candidate's technical skills
 * @param {string} params.jobDescription - Job description
 * @param {string} params.message - Candidate's latest message
 * @param {number} params.step - Current interview step
 * @param {Array} params.history - Conversation history
 */
export async function technicalInterviewChat({ technicalSkills, jobDescription, message, step, history = [] }) {
    const model = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash',
        apiKey: process.env.GOOGLE_API_KEY,
        temperature: 0.3,
    });

    const structuredModel = model.withStructuredOutput(interviewSchema);

    const skillsStr = serializeTechnicalSkills(technicalSkills);

    const prompt = `You are an expert technical interviewer. Your goal is to conduct a professional, deep-dive technical interview with a candidate.

CANDIDATE TECHNICAL SKILLS:
${skillsStr}

JOB DESCRIPTION:
${jobDescription}

CONTEXT:
Current Step: ${step}
Candidate Message: "${message}"

INTERVIEW GUIDELINES:
1. Progressively explore the candidate's skills relevant to the job. Ask REAL, deep technical questions (e.g., about architecture, edge cases, language quirks).
2. If this is the start (step=0, message="start"), introduce yourself and ask the first foundational technical question.
3. REMEMBER your previous answers and the conversation history. Build your next question off of what the candidate just said.
4. STRICT REACTION MODE: Read the "Candidate Message" very carefully.
   - If the candidate says things like "hello", "wait", "hold on", "what?", "who are you?" or asks for clarification (e.g., "please explain"): YOU MUST ONLY ANSWER THEIR QUESTION OR ACKNOWLEDGE THEIR COMMENT. Do NOT ask a new technical question yet.
   - If the candidate's answer to your previous technical question is unclear, vague, or short: DO NOT MOVE ON. Send a follow-up asking for details.
5. If the candidate gives a good answer, acknowledge it briefly and then ask exactly ONE new, targeted technical question.
6. The interview should last about 5-7 steps.
7. If step >= 5 and you feel you have gathered enough information, aim to wrap up the interview and set 'done' to true. Give a final closing botMessage.
8. When 'done' is true, you MUST provide a 'summary' object with precise, realistic scores from 1 to 5 for technical_accuracy, communication, and problem_solving based on the entire conversation.

CONVERSATION HISTORY:
${history.map(h => `${h.type === 'bot' ? 'Interviewer' : 'Candidate'}: ${h.message}`).join('\n')}

Return your response in the specified JSON format.`;

    const result = await structuredModel.invoke(prompt);
    return result;
}
