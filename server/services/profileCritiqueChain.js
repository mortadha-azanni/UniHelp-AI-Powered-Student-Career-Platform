import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';

// Zod schema matching the n8n Structured Output Parser JSON example
const critiqueSchema = z.object({
    strong_points: z.array(
        z.object({
            label: z.string(),
            note: z.number(),
            proof: z.string(),
        })
    ),
    medium_points: z.array(
        z.object({
            label: z.string(),
            note: z.number(),
            proof: z.string(),
        })
    ),
    weak_points: z.array(
        z.object({
            label: z.string(),
            note: z.number(),
            proof: z.string(),
        })
    ),
    overall_score: z.number(),
    advice: z.string(),
});

/**
 * Serialize a profile object into a compact string — mirrors the n8n
 * "Aggregate1 → Code in JavaScript1" transformation.
 */
function serializeProfile(profile) {
    let str = JSON.stringify(profile);
    str = str
        .replace(/\s+/g, ' ')
        .replace(/\\+/g, '')
        .replace(/\n+/g, '')
        .replace(/\r+/g, '');
    return str;
}

/**
 * Critique a candidate profile against a job description using LangChain + Gemini.
 * Mirrors: Webhook1 → Aggregate1 → Code1 → AI Agent1 + Structured Output Parser
 *
 * @param {object} profile - Profile object (personalInfo, skills, education, etc.)
 * @param {string} jobDescription - Job description text
 * @returns {Promise<object>} - Structured critique: { strong_points, medium_points, weak_points, overall_score, advice }
 */
export async function critiqueProfileWithLangChain(profile, jobDescription) {
    const model = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash',
        apiKey: process.env.GOOGLE_API_KEY,
        temperature: 0.5,
    });

    const structuredModel = model.withStructuredOutput(critiqueSchema);

    const mergedProfile = serializeProfile(profile);

    const prompt = `This is the profile of the user:
${mergedProfile}
And this is the job description:
${jobDescription}

Tu es un assistant d'évaluation de profil. Tu reçois deux entrées : 
1) la description du métier (JOB_DESCRIPTION) 
2) le profil candidat (CANDIDATE_PROFILE).

Analyse les deux et retourne UNIQUEMENT un objet JSON avec le format ci-dessous.

Règles :
- Extrais les compétences, missions et attentes clés du métier.
- Compare-les avec le profil du candidat.
- Donne une note pour chaque point de 0 à 100.
- Classe les éléments dans : "strong_points", "medium_points", "weak_points".
- Calcule une "overall_score" globale (0-100).
- Ajoute un "advice" court (1 ou 2 phrases maximum).

Retourne STRICTEMENT ce JSON :

{
  "strong_points": [
    { "label": "string", "note": 0, "proof": "string" }
  ],
  "medium_points": [
    { "label": "string", "note": 0, "proof": "string" }
  ],
  "weak_points": [
    { "label": "string", "note": 0, "proof": "string" }
  ],
  "overall_score": 0,
  "advice": "string"
}

Note :
- "proof" = justification courte (projet, stage, compétence mentionnée).
- Pas de texte en dehors du JSON.`;

    const result = await structuredModel.invoke(prompt);
    return result;
}
