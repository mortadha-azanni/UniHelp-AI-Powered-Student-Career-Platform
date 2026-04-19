import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

// NOTE: llm, parser, and promptTemplate are intentionally NOT created at the
// module top-level. Doing so caused a startup crash because the LangChain SDK
// validates/initialises eagerly — before dotenv had finished loading env vars.
// They are now created lazily inside generateStudyScheduleContent() instead.

// Define the expected output structure using Zod (pure data, no SDK call — safe at top level)
const scheduleSchema = z.object({
    days: z.array(z.object({
        dayNumber: z.number().describe('The day index (1, 2, 3...)'),
        focusArea: z.string().describe('The main topic for this day (e.g., "React Basics")'),
        tasks: z.array(z.object({
            nodeId: z.string().describe('The ID of the roadmap node this task relates to'),
            taskDescription: z.string().describe('A concrete, actionable study task based on the node'),
            estimatedMinutes: z.number().describe('Estimated time to complete this specific task in minutes')
        }))
    }))
});

export const generateStudyScheduleContent = async ({
    roadmap,
    hoursPerDay,
    targetTimeframe,
    familiarityLevel
}) => {
    // Lazy-initialise: nothing runs at module-load time.
    const llm = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash',
        maxOutputTokens: 2048,
        temperature: 0.2,
        apiKey: process.env.GOOGLE_API_KEY
    });

    const parser = StructuredOutputParser.fromZodSchema(scheduleSchema);

    const promptTemplate = new PromptTemplate({
        template: `You are an expert technical learning counselor and study planner.
Your goal is to take a user's learning roadmap and their personal time constraints, and break it down into a highly actionable, day-by-day study schedule.

### USER CONSTRAINTS
- Time available per day: {hoursPerDay} hours
- Desired completion timeframe: {targetTimeframe}
- Familiarity with the subject: {familiarityLevel}

### ROADMAP DETAILS
Title: {roadmapTitle}
Description: {roadmapDescription}
Nodes (Topics to learn):
{nodesList}

### INSTRUCTIONS
1. Analyze the complexity of each node in the roadmap.
2. Distribute the nodes across multiple days. A day can have tasks from multiple nodes if they are short, or a complex node can be split across multiple days.
3. Ensure the total 'estimatedMinutes' for all tasks in a single day does NOT significantly exceed the user's available time per day ({hoursPerDay} hours = {maxMinutesPerDay} minutes).
4. Adapt the depth of the 'taskDescription' based on their familiarity ({familiarityLevel}). If they are already familiar, focus tasks on advanced practice or quick review. If they are beginners, focus on fundamentals.
5. You MUST include every single \`nodeId\` from the roadmap in the schedule at least once so the user completes the entire roadmap.

{format_instructions}
`,
        inputVariables: ['hoursPerDay', 'targetTimeframe', 'familiarityLevel', 'roadmapTitle', 'roadmapDescription', 'nodesList', 'maxMinutesPerDay'],
        partialVariables: { format_instructions: parser.getFormatInstructions() }
    });

    try {
        const nodesList = roadmap.nodes.map(n =>
            `- Node ID: ${n.id} | Topic: ${n.data?.label} | Description: ${n.data?.description || 'None'}`
        ).join('\\n');

        const maxMinutesPerDay = parseFloat(hoursPerDay) * 60;

        const chain = promptTemplate.pipe(llm).pipe(parser);

        console.log(`Generating study schedule for ${roadmap.title}...`);
        const response = await chain.invoke({
            hoursPerDay,
            targetTimeframe,
            familiarityLevel,
            roadmapTitle: roadmap.title,
            roadmapDescription: roadmap.description || 'No description provided.',
            nodesList,
            maxMinutesPerDay
        });

        return response;
    } catch (error) {
        console.error('Error in studyScheduleChain:', error);
        throw new Error('Failed to generate study schedule via AI.');
    }
};
