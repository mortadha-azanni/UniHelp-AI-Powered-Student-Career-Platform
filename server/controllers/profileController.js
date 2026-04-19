import Profile from '../models/Profile.js';

// Get user's profile
export const getProfile = async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user.id });

        // If no profile exists, create an empty one
        if (!profile) {
            profile = new Profile({
                user: req.user.id,
                personalInfo: {},
                education: [],
                workExperience: [],
                projects: [],
                skills: { technical: [], soft: [] },
                certifications: [],
                languages: []
            });
            await profile.save();
        }

        res.json({
            success: true,
            data: { profile }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving profile'
        });
    }
};

// Create or update profile
export const updateProfile = async (req, res) => {
    try {
        const profileData = req.body;

        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // Update existing profile
            Object.assign(profile, profileData);
        } else {
            // Create new profile
            profile = new Profile({
                user: req.user.id,
                ...profileData
            });
        }

        // Calculate completeness
        profile.calculateCompleteness();

        await profile.save();

        res.json({
            success: true,
            data: { profile },
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

// Update specific section
export const updateSection = async (req, res) => {
    try {
        const { section } = req.params;
        const sectionData = req.body;

        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // Update the specific section
        if (section === 'personalInfo') {
            profile.personalInfo = { ...profile.personalInfo, ...sectionData };
        } else if (profile[section] !== undefined) {
            profile[section] = sectionData;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid section'
            });
        }

        profile.calculateCompleteness();
        await profile.save();

        res.json({
            success: true,
            data: { profile },
            message: `${section} updated successfully`
        });
    } catch (error) {
        console.error('Update section error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating section'
        });
    }
};

// Validate profile completeness
export const validateProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            return res.json({
                success: true,
                data: {
                    completeness: 0,
                    missingFields: ['Profile not created']
                }
            });
        }

        const completeness = profile.calculateCompleteness();
        await profile.save();

        const missingFields = [];

        if (!profile.personalInfo.fullName) missingFields.push('Full Name');
        if (!profile.personalInfo.summary) missingFields.push('Professional Summary');
        if (profile.education.length === 0) missingFields.push('Education');
        if (profile.workExperience.length === 0 && profile.projects.length === 0) {
            missingFields.push('Work Experience or Projects');
        }
        if (profile.skills.technical.length < 5) missingFields.push('Technical Skills (min 5)');
        if (profile.skills.soft.length < 3) missingFields.push('Soft Skills (min 3)');

        res.json({
            success: true,
            data: {
                completeness,
                missingFields,
                isComplete: completeness >= 80
            }
        });
    } catch (error) {
        console.error('Validate profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating profile'
        });
    }
};

// Get skill suggestions
export const getSkillSuggestions = async (req, res) => {
    const { category, type } = req.query;

    const technicalSkills = {
        Frontend: ['React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'Redux', 'Next.js', 'Svelte', 'SASS'],
        Backend: ['Node.js', 'Express', 'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'PHP', 'Laravel', 'Ruby on Rails', '.NET', 'FastAPI'],
        Mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Android', 'iOS', 'Xamarin', 'Ionic'],
        Database: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'DynamoDB', 'Oracle', 'SQL Server', 'Cassandra'],
        DevOps: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible'],
        Testing: ['Jest', 'Mocha', 'Cypress', 'Selenium', 'JUnit', 'PyTest', 'Testing Library'],
        Design: ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'UI/UX Design'],
        Other: ['Git', 'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum']
    };

    const softSkills = [
        'Communication', 'Leadership', 'Teamwork', 'Problem Solving',
        'Time Management', 'Adaptability', 'Critical Thinking', 'Creativity',
        'Attention to Detail', 'Project Management', 'Conflict Resolution',
        'Decision Making', 'Emotional Intelligence', 'Negotiation'
    ];

    let suggestions = [];

    if (type === 'soft') {
        suggestions = softSkills;
    } else if (category && technicalSkills[category]) {
        suggestions = technicalSkills[category];
    } else {
        // Return all technical skills
        suggestions = Object.values(technicalSkills).flat();
    }

    res.json({
        success: true,
        data: { suggestions }
    });
};
