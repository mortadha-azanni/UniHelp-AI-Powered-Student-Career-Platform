import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

// NOTE: model, parser, and promptTemplate are intentionally NOT created at the
// module top-level. Doing so caused a startup crash because the LangChain SDK
// validates/initialises the API key connection eagerly — before dotenv had
// finished loading, or when the key is absent in the environment.
// They are now created lazily inside generateRoadmapContent() instead.

// Helper: build edges from a nodes array based on prerequisites
// Used as a client-side fallback only; the AI should generate its own edges.
export const buildEdgesFromPrerequisites = (nodes) => {
    const edges = [];
    nodes.forEach(node => {
        if (node.prerequisites && Array.isArray(node.prerequisites)) {
            node.prerequisites.forEach(prereqId => {
                edges.push({
                    id: `edge-${prereqId}-${node.id}`,
                    source: prereqId,
                    target: node.id,
                    type: 'default'
                });
            });
        }
    });
    return edges;
};

// Define the expected output structure.
// IMPORTANT: Keep this schema as permissive as possible so ANY domain works
// (software, data science, languages, design, business, etc.).
const roadmapSchema = z.object({
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    tags: z.array(z.string()),
    status: z.enum(['not_started', 'in_progress', 'completed']),
    progressPercentage: z.number(),
    nodes: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        status: z.enum(['done', 'in_progress', 'pending']),
        order: z.number(),
        prerequisites: z.array(z.string()),
        resources: z.array(z.object({
            // Use z.string() so ANY resource type the model returns is accepted
            type: z.string(),
            title: z.string(),
            url: z.string()
        })).optional(),
        tools: z.array(z.object({
            name: z.string(),
            // Use z.string() so ANY tool category is accepted (ml_library, visualization, etc.)
            type: z.string()
        })).optional()
    })),
    edges: z.array(z.object({
        id: z.string(),
        source: z.string(),
        target: z.string(),
        type: z.string().default('default')
    }))
});

export const generateRoadmapContent = async ({ goal, profile }) => {
    const parser = StructuredOutputParser.fromZodSchema(roadmapSchema);

    const promptTemplate = new PromptTemplate({
        template: `You are an expert curriculum designer, mentor, and learning path architect.
You can generate learning roadmaps for ANY domain: software engineering, data science,
machine learning, design, languages, business, mathematics, arts, or anything else.

Your task is to generate a **personalized learning roadmap** based on:
- The user's profile (skills, experience, level)
- What the user wants to learn (could be ANY subject)

You must create a structured roadmap that:
- Avoids unnecessary topics
- Skips what the user already knows
- Focuses only on what's relevant to the goal
- Respects logical prerequisites
- Is optimized for real, practical mastery of the subject
- Is compatible with React Flow graph rendering as a **visual tree/graph** (NOT a linear list)

---

## 📥 INPUT FORMAT

You will receive:
- **Goal**: {goal}
- **Profile**: {profile}

---

## 🧩 GENERATION RULES

1. Analyze the goal deeply — it could be software, data science, a language, a skill, etc.
2. Analyze the profile carefully.
3. Identify:
   - Already mastered skills (do NOT include them as new nodes).
   - Missing prerequisites.
   - Optimal learning sequence.
4. Do NOT introduce topics unrelated to the goal.
5. **CRITICAL — GRAPH STRUCTURE (not a list):**
   - The roadmap MUST be shaped like a **tree or DAG (Directed Acyclic Graph)**, NOT a simple linear list.
   - There must be **branching**: a single node can be the prerequisite for MULTIPLE children nodes that can be learned in PARALLEL.
   - There must be **convergence**: multiple nodes can be prerequisites for a single advanced node.
   - Aim for **3–5 parallel tracks** of related topics that branch from early foundations and later merge into advanced topics.
   - Example good structure:
     - Root (foundations) → branches into Track A, Track B, Track C
     - Track A has 2–4 sequential nodes
     - Track B has 2–4 sequential nodes
     - Track C has 2–4 sequential nodes
     - All tracks converge into a final capstone node
   - NEVER generate a simple A→B→C→D→E chain for all nodes.
6. Assign \`order\` values that reflect BFS/topological level (1 = root, 2 = first branches, 3 = deeper, etc.).
7. Generate realistic resources (official docs, well-known courses, books, papers, etc.).
8. Each node must contain:
   - Clear description of what it is and why it matters.
   - Learning resources (documentation, course, article, video, book, paper, tutorial, dataset, etc.).
   - Tools, technologies, libraries, or instruments relevant to the topic (use any descriptive type string, e.g. "ml_library", "visualization", "language", "framework", "tool", "concept", "software", etc.).
   - Status:
     - "done" → if clearly mastered in profile
     - "in_progress" → if partially related to profile
     - "pending" → if new skill
9. Difficulty should match user level progression.
10. progressPercentage must reflect how many nodes are marked "done" (0-100).
11. Status of roadmap:
    - "not_started" → if 0% done
    - "in_progress" → if between 1–99%
    - "completed" → if 100%
12. Edges MUST reflect the branching graph structure. Each edge connects a prerequisite (source) to a dependent node (target).

---

## 📤 OUTPUT FORMAT (STRICT JSON ONLY — NO TEXT)

{format_instructions}

---

## 🔒 STRICT RULES

* Return ONLY valid JSON.
* No explanations, no markdown, no comments, no trailing commas.
* URLs must be real and valid when possible (prefer official docs/reputable sources).
* Edges MUST reflect a branching graph — multiple children per parent, parallel tracks, convergence points.
* NEVER produce a simple single-chain graph where each node has only one child.
* Order values must reflect topological depth (root = 1, leaves = highest number).
* Generate between 10 and 20 nodes depending on complexity of the goal.
* The graph must have at least 3 parallel branches visible when rendered top-to-bottom.

---

## 🎯 GOAL

Generate a complete, production-ready roadmap object that can be:
* Stored directly in MongoDB
* Rendered immediately using React Flow
* Used for progress tracking
`,
        inputVariables: ['goal', 'profile'],
        partialVariables: { format_instructions: parser.getFormatInstructions() }
    });

    // ── Tier 1: Try all Google API keys (rotate on quota error) ─────────────
    const googleKeys = [
        process.env.GOOGLE_API_KEY,
        process.env.GOOGLE_API_KEY_BACKUP,
    ].filter(Boolean);

    let lastError;

    for (const apiKey of googleKeys) {
        try {
            console.log(`   🔑 [Tier 1] Trying Google API Key (...${apiKey.slice(-4)}) with gemini-2.5-flash...`);
            const model = new ChatGoogleGenerativeAI({
                model: 'gemini-2.5-flash',
                temperature: 0.2,
                maxOutputTokens: 16384,
                apiKey,
            });

            const chain = promptTemplate.pipe(model).pipe(parser);
            const response = await chain.invoke({
                goal: JSON.stringify(goal),
                profile: JSON.stringify(profile)
            });
            console.log(`✅ [Tier 1] Success via Google Key.`);
            return response;

        } catch (error) {
            const isQuotaError = error?.status === 429
                || error?.message?.includes('quota')
                || error?.message?.includes('RESOURCE_EXHAUSTED')
                || error?.message?.includes('rate limit');

            if (isQuotaError) {
                console.warn(`⚠️  [Tier 1] Quota exceeded on Google Key. trying next...`);
                lastError = error;
                continue;
            }
            console.error('❌ [Tier 1] Non-quota error (Google):', error.message);
            throw new Error('Failed to generate roadmap content via Google AI.');
        }
    }

    // ── Tier 2: OpenRouter fallback (confirmed working) ───────────────────────
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey) {
        console.warn('📡 [Tier 2] All Google keys exhausted. Falling back to OpenRouter (google/gemini-2.5-flash)...');
        try {
            const orModel = new ChatOpenAI({
                model: 'google/gemini-2.5-flash',   // OpenRouter model ID
                temperature: 0.2,
                maxTokens: 16384,
                openAIApiKey: openRouterKey,
                configuration: {
                    baseURL: 'https://openrouter.ai/api/v1',
                    defaultHeaders: {
                        'HTTP-Referer': 'http://localhost:5173',
                        'X-Title': 'UniHelp Roadmap Generator',
                    }
                }
            });

            const chain = promptTemplate.pipe(orModel).pipe(parser);
            const response = await chain.invoke({
                goal: JSON.stringify(goal),
                profile: JSON.stringify(profile)
            });
            console.log('✅ [Tier 2] Success via OpenRouter.');
            return response;

        } catch (orError) {
            console.error('❌ [Tier 2] OpenRouter fallback also failed:', orError.message);
            lastError = orError;
        }
    }

    // All providers failed
    console.error('🛑 [FATAL] All AI providers failed. Last error:', lastError?.message);
    throw new Error('All AI providers are unavailable. Please try again later.');
};

