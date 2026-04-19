import { ChatOpenAI } from '@langchain/openai';

/**
 * AI-powered lesson chatbot using OpenRouter API.
 * Teaches users interactively about specific topics in their learning program.
 */
export async function chatWithLessonTutor({
    programTitle,
    moduleTitle,
    lessonTitle,
    lessonDescription,
    userMessage,
    chatHistory = []
}) {
    const model = new ChatOpenAI({
        modelName: 'google/gemini-2.5-flash',
        temperature: 0.4,
        maxTokens: 2048,
        configuration: {
            baseURL: 'https://openrouter.ai/api/v1',
        },
        apiKey: process.env.OPENROUTER_API_KEY,
    });

    const historyStr = chatHistory
        .slice(-20) // Keep last 20 messages for context
        .map(h => `${h.role === 'assistant' ? 'Tutor' : 'Student'}: ${h.content}`)
        .join('\n');

    const systemPrompt = `Tu es un tuteur IA expert et bienveillant. Ta mission est d'enseigner de manière interactive.

PROGRAMME: ${programTitle}
MODULE: ${moduleTitle}
LEÇON: ${lessonTitle}
${lessonDescription ? `DESCRIPTION: ${lessonDescription}` : ''}

RÈGLES:
1. Enseigne le sujet "${lessonTitle}" de manière claire, structurée et progressive.
2. Utilise des exemples concrets et du code quand c'est pertinent.
3. Adapte ton niveau au student : si il pose des questions basiques, simplifie. Si il maîtrise, approfondis.
4. Pose des questions pour vérifier la compréhension.
5. Si le student dit "start" ou commence la conversation, présente le sujet et commence avec les fondamentaux.
6. Sois encourageant et motivant.
7. Utilise des émojis pour rendre la conversation vivante.
8. Réponds TOUJOURS en français.
9. Si le student montre qu'il maîtrise bien le sujet (après au moins 3-4 échanges substantiels), félicite-le et suggère de marquer la leçon comme terminée.
10. Formate tes réponses en Markdown pour une meilleure lisibilité.

HISTORIQUE DE CONVERSATION:
${historyStr || 'Aucun historique - c\'est le début de la leçon.'}

MESSAGE DU STUDENT: "${userMessage}"

Réponds en tant que tuteur:`;

    try {
        const response = await model.invoke(systemPrompt);
        return {
            role: 'assistant',
            content: response.content
        };
    } catch (error) {
        console.error('Error in programChatChain:', error);
        throw new Error('Failed to get AI response: ' + error.message);
    }
}
