import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";

/**
 * Strict, LLM-safe quiz schema
 */
const quizSchema = z.object({
  questions: z
    .array(
      z
        .object({
          question_text: z.string().min(1),

          // Exactly 3 options, simple and stable structure
          options: z.array(z.string().min(1)).length(3),

          correct_answer: z.string().min(1),
        })
        .refine(
          (data) => data.options.includes(data.correct_answer),
          {
            message: "correct_answer must match one of the options",
          }
        )
    )
    .length(10),
});

/**
 * Serialize technical skills safely (avoids Mongoose circular refs)
 */
function serializeTechnicalSkills(technicalSkills) {
  const plain = (technicalSkills || []).map((s) => ({
    name: s?.name || "",
    category: s?.category || "Other",
    proficiency: s?.proficiency || "Intermediate",
  }));

  return JSON.stringify(plain);
}

/**
 * Generate 10 technical interview quiz questions using Gemini
 */
export async function generateTechnicalQuiz(
  technicalSkills,
  jobDescription
) {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("Missing GOOGLE_API_KEY in environment variables.");
  }

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite", // change if quota issue
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.7,
  });

  const structuredModel = model.withStructuredOutput(quizSchema);

  const mergedSkills = serializeTechnicalSkills(technicalSkills);

  const prompt = `
You are a technical interview assistant.

Candidate technical skills:
${mergedSkills}

Job description:
${jobDescription}

Generate EXACTLY 10 professional technical interview questions.

Rules:
- Short, precise, and unambiguous
- Practical and real-world focused
- One clear correct answer
- Exactly 3 answer options per question
- correct_answer must match exactly one of the options
- Professional interview-level difficulty

Return structured JSON only.
`;

  const result = await structuredModel.invoke(prompt);

  return result;
}