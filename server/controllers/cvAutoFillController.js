import Profile from '../models/Profile.js';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';

// Zod schema matching the Profile model structure
const cvProfileSchema = z.object({
    personalInfo: z.object({
        fullName: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        linkedin: z.string().optional(),
        github: z.string().optional(),
        website: z.string().optional(),
        summary: z.string().optional(),
    }).optional(),
    education: z.array(z.object({
        institution: z.string(),
        degree: z.string(),
        field: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        current: z.boolean().optional(),
        gpa: z.string().optional(),
        achievements: z.array(z.string()).optional(),
    })).optional(),
    workExperience: z.array(z.object({
        company: z.string(),
        position: z.string(),
        location: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        current: z.boolean().optional(),
        responsibilities: z.array(z.string()).optional(),
        achievements: z.array(z.string()).optional(),
    })).optional(),
    projects: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
        technologies: z.array(z.string()).optional(),
        url: z.string().optional(),
        github: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
    })).optional(),
    skills: z.object({
        technical: z.array(z.object({
            name: z.string(),
            category: z.enum(['Frontend', 'Backend', 'Mobile', 'Database', 'DevOps', 'Testing', 'Design', 'Other']).optional(),
            proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
        })).optional(),
        soft: z.array(z.object({
            name: z.string(),
            proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
        })).optional(),
    }).optional(),
    certifications: z.array(z.object({
        name: z.string(),
        issuer: z.string().optional(),
        date: z.string().optional(),
        url: z.string().optional(),
    })).optional(),
    languages: z.array(z.object({
        name: z.string(),
        proficiency: z.enum(['Native', 'Fluent', 'Professional', 'Limited']).optional(),
    })).optional(),
});

/**
 * POST /api/profile/autofill-cv
 * Send the PDF directly to Gemini multimodal — no pdf-parse needed.
 */
export const autoFillProfileFromCV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No PDF file uploaded. Please attach a PDF file.'
            });
        }

        // Convert PDF buffer to base64 for Gemini multimodal
        const pdfBase64 = req.file.buffer.toString('base64');

        console.log(`PDF received (${req.file.size} bytes). Sending directly to Gemini...`);

        // Get existing profile to send as context
        let profile = await Profile.findOne({ user: req.user.id });
        const existingProfile = profile ? profile.toObject() : null;

        // Build the Gemini multimodal model with structured output
        const model = new ChatGoogleGenerativeAI({
            model: 'gemini-2.5-flash',
            apiKey: process.env.GOOGLE_API_KEY,
            temperature: 0.1,
        });

        const structuredModel = model.withStructuredOutput(cvProfileSchema);

        // Build the multimodal message: PDF file + text instructions
        const message = new HumanMessage({
            content: [
                {
                    type: 'media',
                    mimeType: 'application/pdf',
                    data: pdfBase64,
                },
                {
                    type: 'text',
                    text: `You are a CV parser. Extract ALL information from the attached PDF CV and return it as structured data.

${existingProfile ? `Here is the user's existing profile (keep existing data, only ADD or UPDATE from the CV):\n${JSON.stringify(existingProfile, null, 2)}\n` : 'The user has no existing profile yet. Extract everything from the CV.'}

Rules:
- Extract ALL information present in the CV
- For dates, use strings like "2022-01" or "2022-01-01"
- For technical skills, infer category (Frontend/Backend/Mobile/Database/DevOps/Testing/Design/Other) and proficiency (Beginner/Intermediate/Advanced/Expert) from context
- For spoken languages, detect proficiency: Native/Fluent/Professional/Limited
- If the user already has data in a field, keep the existing value unless the CV has better/more complete data
- Do NOT invent data — only extract what is actually in the CV
- For responsibilities and achievements, split into individual strings in an array
- Make sure proficiency values EXACTLY match the allowed enum values`,
                },
            ],
        });

        const extracted = await structuredModel.invoke([message]);

        console.log('Gemini extracted profile data successfully');

        // Save to database
        if (!profile) {
            profile = new Profile({ user: req.user.id });
        }

        // Apply extracted data
        if (extracted.personalInfo) {
            profile.personalInfo = {
                ...(profile.personalInfo?.toObject?.() || profile.personalInfo || {}),
                ...extracted.personalInfo,
            };
        }
        if (extracted.education?.length) profile.education = extracted.education;
        if (extracted.workExperience?.length) profile.workExperience = extracted.workExperience;
        if (extracted.projects?.length) profile.projects = extracted.projects;
        if (extracted.skills) {
            profile.skills = {
                technical: extracted.skills.technical || profile.skills?.technical || [],
                soft: extracted.skills.soft || profile.skills?.soft || [],
            };
        }
        if (extracted.certifications?.length) profile.certifications = extracted.certifications;
        if (extracted.languages?.length) profile.languages = extracted.languages;

        profile.calculateCompleteness();
        await profile.save();

        res.json({
            success: true,
            message: 'Profile auto-filled successfully from your CV!',
            data: { profile }
        });

    } catch (error) {
        console.error('CV Auto-fill error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing CV. Please try again.',
            error: error.message
        });
    }
};
