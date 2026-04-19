import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
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
 * Extract structured profile data from raw CV text using LangChain + Gemini.
 *
 * @param {string} cvText - Raw text extracted from a PDF CV
 * @returns {Promise<object>} - Structured profile data matching the Profile model
 */
export async function extractProfileFromCVText(cvText) {
    const model = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash',
        apiKey: process.env.GOOGLE_API_KEY,
        temperature: 0.1, // low temperature for accurate extraction
    });

    const structuredModel = model.withStructuredOutput(cvProfileSchema);

    const prompt = `You are a CV parser. Extract all information from the following CV text and return it as structured data.

Rules:
- Extract ALL information present in the CV
- For dates, use ISO format strings like "2022-01-01" or just "2022-01" — do NOT parse into Date objects
- For technical skills, infer the category (Frontend/Backend/Mobile/Database/DevOps/Testing/Design/Other) and proficiency (Beginner/Intermediate/Advanced/Expert) from context
- For soft skills, use common names like "Communication", "Leadership" etc.
- For languages (spoken), detect proficiency level: Native/Fluent/Professional/Limited
- If a field is not present in the CV, omit it (do NOT invent data)
- Keep the summary/about section as-is from the CV
- For responsibilities and achievements, split into individual bullet points (array of strings)
- Normalize all proficiency values to fit the allowed enum values exactly

CV TEXT:
---
${cvText}
---`;

    const result = await structuredModel.invoke(prompt);
    return result;
}

/**
 * Merge extracted CV data into an existing profile.
 * Strategy: new data is added, existing data is preserved unless explicitly overwritten.
 * Arrays are merged (deduplication by name/institution/company).
 *
 * @param {object} existingProfile - Current profile from MongoDB
 * @param {object} extracted - Extracted profile data from CV
 * @returns {object} - Merged profile data to save
 */
export function mergeProfileData(existingProfile, extracted) {
    const merged = {
        personalInfo: {
            ...existingProfile.personalInfo?.toObject?.() ?? existingProfile.personalInfo ?? {},
        },
        education: [...(existingProfile.education ?? [])],
        workExperience: [...(existingProfile.workExperience ?? [])],
        projects: [...(existingProfile.projects ?? [])],
        skills: {
            technical: [...(existingProfile.skills?.technical ?? [])],
            soft: [...(existingProfile.skills?.soft ?? [])],
        },
        certifications: [...(existingProfile.certifications ?? [])],
        languages: [...(existingProfile.languages ?? [])],
    };

    // Merge personalInfo — only fill in missing fields
    if (extracted.personalInfo) {
        for (const [key, val] of Object.entries(extracted.personalInfo)) {
            if (val && !merged.personalInfo[key]) {
                merged.personalInfo[key] = val;
            }
        }
    }

    // Merge education — avoid duplicate institutions
    if (extracted.education?.length) {
        const existingInstitutions = new Set(
            merged.education.map(e => e.institution?.toLowerCase?.())
        );
        for (const edu of extracted.education) {
            if (!existingInstitutions.has(edu.institution?.toLowerCase?.())) {
                merged.education.push(edu);
                existingInstitutions.add(edu.institution?.toLowerCase?.());
            }
        }
    }

    // Merge workExperience — avoid duplicate company+position combos
    if (extracted.workExperience?.length) {
        const existingJobs = new Set(
            merged.workExperience.map(e => `${e.company?.toLowerCase()}_${e.position?.toLowerCase()}`)
        );
        for (const exp of extracted.workExperience) {
            const key = `${exp.company?.toLowerCase()}_${exp.position?.toLowerCase()}`;
            if (!existingJobs.has(key)) {
                merged.workExperience.push(exp);
                existingJobs.add(key);
            }
        }
    }

    // Merge projects — avoid duplicate project names
    if (extracted.projects?.length) {
        const existingProjects = new Set(
            merged.projects.map(p => p.name?.toLowerCase())
        );
        for (const proj of extracted.projects) {
            if (!existingProjects.has(proj.name?.toLowerCase())) {
                merged.projects.push(proj);
                existingProjects.add(proj.name?.toLowerCase());
            }
        }
    }

    // Merge technical skills — avoid duplicates by name
    if (extracted.skills?.technical?.length) {
        const existingSkills = new Set(
            merged.skills.technical.map(s => s.name?.toLowerCase())
        );
        for (const skill of extracted.skills.technical) {
            if (!existingSkills.has(skill.name?.toLowerCase())) {
                merged.skills.technical.push(skill);
                existingSkills.add(skill.name?.toLowerCase());
            }
        }
    }

    // Merge soft skills — avoid duplicates by name
    if (extracted.skills?.soft?.length) {
        const existingSoft = new Set(
            merged.skills.soft.map(s => s.name?.toLowerCase())
        );
        for (const skill of extracted.skills.soft) {
            if (!existingSoft.has(skill.name?.toLowerCase())) {
                merged.skills.soft.push(skill);
                existingSoft.add(skill.name?.toLowerCase());
            }
        }
    }

    // Merge certifications — avoid duplicates by name
    if (extracted.certifications?.length) {
        const existingCerts = new Set(
            merged.certifications.map(c => c.name?.toLowerCase())
        );
        for (const cert of extracted.certifications) {
            if (!existingCerts.has(cert.name?.toLowerCase())) {
                merged.certifications.push(cert);
                existingCerts.add(cert.name?.toLowerCase());
            }
        }
    }

    // Merge languages — avoid duplicates by name
    if (extracted.languages?.length) {
        const existingLangs = new Set(
            merged.languages.map(l => l.name?.toLowerCase())
        );
        for (const lang of extracted.languages) {
            if (!existingLangs.has(lang.name?.toLowerCase())) {
                merged.languages.push(lang);
                existingLangs.add(lang.name?.toLowerCase());
            }
        }
    }

    return merged;
}
