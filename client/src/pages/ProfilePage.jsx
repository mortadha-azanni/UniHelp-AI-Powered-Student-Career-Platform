import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateSection, updateProfile } from '../api/profileService';
import api from '../api/axios';

const ProfilePage = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [activeTab, setActiveTab] = useState('personal');
    // CV Auto-fill state
    const [isAutoFilling, setIsAutoFilling] = useState(false);
    const [autoFillMessage, setAutoFillMessage] = useState('');
    const [autoFillError, setAutoFillError] = useState('');
    const cvFileInputRef = useRef(null);

    const [profileData, setProfileData] = useState({
        personalInfo: {
            fullName: '',
            phone: '',
            address: '',
            city: '',
            country: '',
            linkedin: '',
            github: '',
            website: '',
            summary: ''
        },
        education: [],
        workExperience: [],
        skills: {
            technical: [],
            soft: []
        },
        projects: [],
        certifications: [],
        languages: []
    });

    // Load profile data on component mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoading(true);
                const response = await getProfile();

                if (response.success && response.data.profile) {
                    const profile = response.data.profile;
                    setProfileData({
                        personalInfo: profile.personalInfo || profileData.personalInfo,
                        education: profile.education || [],
                        workExperience: profile.workExperience || [],
                        skills: profile.skills || { technical: [], soft: [] },
                        projects: profile.projects || [],
                        certifications: profile.certifications || [],
                        languages: profile.languages || []
                    });
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handlePersonalInfoChange = (e) => {
        setProfileData({
            ...profileData,
            personalInfo: {
                ...profileData.personalInfo,
                [e.target.name]: e.target.value
            }
        });
        if (saveMessage) setSaveMessage('');
    };

    const handleSaveSection = async (section) => {
        try {
            setIsSaving(true);
            setSaveMessage('');

            const response = await updateSection(section, profileData[section]);

            if (response.success) {
                setSaveMessage('Enregistré avec succès! ✓');
                setTimeout(() => setSaveMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error saving:', error);
            setSaveMessage('Erreur lors de l\'enregistrement');
        } finally {
            setIsSaving(false);
        }
    };

    // CV Auto-fill handler
    const handleAutoFillCV = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Reset input so same file can be re-selected
        e.target.value = '';

        setIsAutoFilling(true);
        setAutoFillMessage('');
        setAutoFillError('');

        try {
            const formData = new FormData();
            formData.append('cv', file);

            const response = await api.post('/profile/autofill-cv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                const profile = response.data.data.profile;
                // Reload the profile into state
                setProfileData({
                    personalInfo: profile.personalInfo || profileData.personalInfo,
                    education: profile.education || [],
                    workExperience: profile.workExperience || [],
                    skills: profile.skills || { technical: [], soft: [] },
                    projects: profile.projects || [],
                    certifications: profile.certifications || [],
                    languages: profile.languages || []
                });
                setAutoFillMessage('✅ Profil auto-rempli avec succès depuis votre CV !');
                setTimeout(() => setAutoFillMessage(''), 6000);
            }
        } catch (err) {
            console.error('Auto-fill error:', err);
            setAutoFillError(err.response?.data?.message || 'Erreur lors du traitement du CV. Réessayez.');
            setTimeout(() => setAutoFillError(''), 6000);
        } finally {
            setIsAutoFilling(false);
        }
    };

    // Education handlers
    const addEducation = () => {
        setProfileData({
            ...profileData,
            education: [
                ...profileData.education,
                {
                    institution: '',
                    degree: '',
                    field: '',
                    startDate: '',
                    endDate: '',
                    current: false,
                    gpa: '',
                    achievements: []
                }
            ]
        });
    };

    const removeEducation = (index) => {
        setProfileData({
            ...profileData,
            education: profileData.education.filter((_, i) => i !== index)
        });
    };

    const updateEducation = (index, field, value) => {
        const updated = [...profileData.education];
        updated[index] = { ...updated[index], [field]: value };
        setProfileData({ ...profileData, education: updated });
    };

    // Work Experience handlers
    const addWorkExperience = () => {
        setProfileData({
            ...profileData,
            workExperience: [
                ...profileData.workExperience,
                {
                    company: '',
                    position: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    current: false,
                    responsibilities: [],
                    achievements: []
                }
            ]
        });
    };

    const removeWorkExperience = (index) => {
        setProfileData({
            ...profileData,
            workExperience: profileData.workExperience.filter((_, i) => i !== index)
        });
    };

    const updateWorkExperience = (index, field, value) => {
        const updated = [...profileData.workExperience];
        updated[index] = { ...updated[index], [field]: value };
        setProfileData({ ...profileData, workExperience: updated });
    };

    // Skills handlers
    const addTechnicalSkill = () => {
        setProfileData({
            ...profileData,
            skills: {
                ...profileData.skills,
                technical: [
                    ...profileData.skills.technical,
                    { name: '', category: 'Other', proficiency: 'Intermediate' }
                ]
            }
        });
    };

    const removeTechnicalSkill = (index) => {
        setProfileData({
            ...profileData,
            skills: {
                ...profileData.skills,
                technical: profileData.skills.technical.filter((_, i) => i !== index)
            }
        });
    };

    const updateTechnicalSkill = (index, field, value) => {
        const updated = [...profileData.skills.technical];
        updated[index] = { ...updated[index], [field]: value };
        setProfileData({
            ...profileData,
            skills: { ...profileData.skills, technical: updated }
        });
    };

    const addSoftSkill = () => {
        setProfileData({
            ...profileData,
            skills: {
                ...profileData.skills,
                soft: [
                    ...profileData.skills.soft,
                    { name: '', proficiency: 'Intermediate' }
                ]
            }
        });
    };

    const removeSoftSkill = (index) => {
        setProfileData({
            ...profileData,
            skills: {
                ...profileData.skills,
                soft: profileData.skills.soft.filter((_, i) => i !== index)
            }
        });
    };

    const updateSoftSkill = (index, field, value) => {
        const updated = [...profileData.skills.soft];
        updated[index] = { ...updated[index], [field]: value };
        setProfileData({
            ...profileData,
            skills: { ...profileData.skills, soft: updated }
        });
    };

    if (isLoading) {
        return (
            <div className="dashboard-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Chargement du profil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2>Mon Profil CV</h2>
                        <p className="subtitle">Gérez toutes les informations de votre CV professionnel</p>
                    </div>
                    {/* CV Auto-Fill Button */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <input
                            ref={cvFileInputRef}
                            type="file"
                            accept="application/pdf"
                            onChange={handleAutoFillCV}
                            style={{ display: 'none' }}
                            id="cv-autofill-input"
                        />
                        <button
                            onClick={() => cvFileInputRef.current?.click()}
                            disabled={isAutoFilling}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.65rem 1.2rem', borderRadius: '10px',
                                background: isAutoFilling ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white', border: 'none', cursor: isAutoFilling ? 'not-allowed' : 'pointer',
                                fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {isAutoFilling ? (
                                <>
                                    <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                    Analyse du CV...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                    Auto-remplir depuis un CV (PDF)
                                </>
                            )}
                        </button>
                        <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Importe les infos depuis votre PDF</small>
                    </div>
                </div>
            </div>

            {/* Auto-fill feedback messages */}
            {autoFillMessage && (
                <div style={{ padding: '0.85rem 1.2rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '10px', border: '1px solid #6ee7b7', marginBottom: '1rem', fontWeight: 500 }}>
                    {autoFillMessage}
                </div>
            )}
            {autoFillError && (
                <div style={{ padding: '0.85rem 1.2rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '10px', border: '1px solid #fca5a5', marginBottom: '1rem', fontWeight: 500 }}>
                    {autoFillError}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="profile-tabs">
                <button
                    className={`tab-item ${activeTab === 'personal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('personal')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Personnel
                </button>
                <button
                    className={`tab-item ${activeTab === 'education' ? 'active' : ''}`}
                    onClick={() => setActiveTab('education')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                    </svg>
                    Éducation
                </button>
                <button
                    className={`tab-item ${activeTab === 'experience' ? 'active' : ''}`}
                    onClick={() => setActiveTab('experience')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    Expérience
                </button>
                <button
                    className={`tab-item ${activeTab === 'skills' ? 'active' : ''}`}
                    onClick={() => setActiveTab('skills')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    Compétences
                </button>
            </div>

            {saveMessage && (
                <div className={`save-message ${saveMessage.includes('Erreur') ? 'error' : 'success'}`}>
                    {saveMessage}
                </div>
            )}

            {/* Tab Content */}
            <div className="content-card">
                {activeTab === 'personal' && (
                    <PersonalInfoTab
                        data={profileData.personalInfo}
                        onChange={handlePersonalInfoChange}
                        onSave={() => handleSaveSection('personalInfo')}
                        isSaving={isSaving}
                    />
                )}

                {activeTab === 'education' && (
                    <EducationTab
                        data={profileData.education}
                        onAdd={addEducation}
                        onRemove={removeEducation}
                        onUpdate={updateEducation}
                        onSave={() => handleSaveSection('education')}
                        isSaving={isSaving}
                    />
                )}

                {activeTab === 'experience' && (
                    <ExperienceTab
                        data={profileData.workExperience}
                        onAdd={addWorkExperience}
                        onRemove={removeWorkExperience}
                        onUpdate={updateWorkExperience}
                        onSave={() => handleSaveSection('workExperience')}
                        isSaving={isSaving}
                    />
                )}

                {activeTab === 'skills' && (
                    <SkillsTab
                        data={profileData.skills}
                        onAddTechnical={addTechnicalSkill}
                        onRemoveTechnical={removeTechnicalSkill}
                        onUpdateTechnical={updateTechnicalSkill}
                        onAddSoft={addSoftSkill}
                        onRemoveSoft={removeSoftSkill}
                        onUpdateSoft={updateSoftSkill}
                        onSave={() => handleSaveSection('skills')}
                        isSaving={isSaving}
                    />
                )}
            </div>
        </div>
    );
};

// Personal Info Tab Component
const PersonalInfoTab = ({ data, onChange, onSave, isSaving }) => (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="auth-form">
        <div className="form-section">
            <h3>Informations personnelles</h3>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="fullName">Nom complet *</label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={data.fullName}
                        onChange={onChange}
                        placeholder="Jean Dupont"
                        disabled={isSaving}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Téléphone</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={data.phone}
                        onChange={onChange}
                        placeholder="+33 6 12 34 56 78"
                        disabled={isSaving}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="city">Ville</label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        value={data.city}
                        onChange={onChange}
                        placeholder="Paris"
                        disabled={isSaving}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="country">Pays</label>
                    <input
                        type="text"
                        id="country"
                        name="country"
                        value={data.country}
                        onChange={onChange}
                        placeholder="France"
                        disabled={isSaving}
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="address">Adresse complète</label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    value={data.address}
                    onChange={onChange}
                    placeholder="123 Rue Example, 75001 Paris"
                    disabled={isSaving}
                />
            </div>
        </div>

        <div className="form-section">
            <h3>Liens professionnels</h3>

            <div className="form-group">
                <label htmlFor="linkedin">LinkedIn</label>
                <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    value={data.linkedin}
                    onChange={onChange}
                    placeholder="https://linkedin.com/in/username"
                    disabled={isSaving}
                />
            </div>

            <div className="form-group">
                <label htmlFor="github">GitHub</label>
                <input
                    type="url"
                    id="github"
                    name="github"
                    value={data.github}
                    onChange={onChange}
                    placeholder="https://github.com/username"
                    disabled={isSaving}
                />
            </div>

            <div className="form-group">
                <label htmlFor="website">Site Web</label>
                <input
                    type="url"
                    id="website"
                    name="website"
                    value={data.website}
                    onChange={onChange}
                    placeholder="https://monsite.com"
                    disabled={isSaving}
                />
            </div>
        </div>

        <div className="form-section">
            <h3>Résumé professionnel</h3>

            <div className="form-group">
                <label htmlFor="summary">À propos *</label>
                <textarea
                    id="summary"
                    name="summary"
                    value={data.summary}
                    onChange={onChange}
                    placeholder="Décrivez brièvement votre profil professionnel, vos compétences clés et vos objectifs de carrière..."
                    rows="6"
                    className="textarea-input"
                    disabled={isSaving}
                />
                <small>Minimum 50 caractères recommandés</small>
            </div>
        </div>

        <button type="submit" className="btn-primary" disabled={isSaving}>
            {isSaving ? (
                <>
                    <span className="spinner-small"></span>
                    Enregistrement...
                </>
            ) : (
                'Enregistrer'
            )}
        </button>
    </form>
);

// Education Tab Component
const EducationTab = ({ data, onAdd, onRemove, onUpdate, onSave, isSaving }) => (
    <div className="tab-content">
        <div className="section-header">
            <h3>Parcours académique</h3>
            <button onClick={onAdd} className="btn-add" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Ajouter une formation
            </button>
        </div>

        {data.length === 0 ? (
            <div className="empty-state">
                <p>Aucune formation ajoutée. Cliquez sur "Ajouter une formation" pour commencer.</p>
            </div>
        ) : (
            <div className="dynamic-list">
                {data.map((edu, index) => (
                    <div key={index} className="list-item">
                        <div className="item-header">
                            <span className="item-number">Formation #{index + 1}</span>
                            <button onClick={() => onRemove(index)} className="btn-remove" type="button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                Supprimer
                            </button>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Institution</label>
                                <input
                                    type="text"
                                    value={edu.institution}
                                    onChange={(e) => onUpdate(index, 'institution', e.target.value)}
                                    placeholder="Université Paris-Sorbonne"
                                />
                            </div>

                            <div className="form-group">
                                <label>Diplôme</label>
                                <input
                                    type="text"
                                    value={edu.degree}
                                    onChange={(e) => onUpdate(index, 'degree', e.target.value)}
                                    placeholder="Master"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Domaine d'étude</label>
                            <input
                                type="text"
                                value={edu.field}
                                onChange={(e) => onUpdate(index, 'field', e.target.value)}
                                placeholder="Informatique"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Date de début</label>
                                <input
                                    type="month"
                                    value={edu.startDate}
                                    onChange={(e) => onUpdate(index, 'startDate', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Date de fin</label>
                                <input
                                    type="month"
                                    value={edu.endDate}
                                    onChange={(e) => onUpdate(index, 'endDate', e.target.value)}
                                    disabled={edu.current}
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={edu.current}
                                        onChange={(e) => onUpdate(index, 'current', e.target.checked)}
                                    />
                                    En cours
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>GPA / Mention (optionnel)</label>
                            <input
                                type="text"
                                value={edu.gpa}
                                onChange={(e) => onUpdate(index, 'gpa', e.target.value)}
                                placeholder="3.8 / 4.0"
                            />
                        </div>
                    </div>
                ))}
            </div>
        )}

        <button onClick={onSave} className="btn-primary" disabled={isSaving} type="button">
            {isSaving ? (
                <>
                    <span className="spinner-small"></span>
                    Enregistrement...
                </>
            ) : (
                'Enregistrer'
            )}
        </button>
    </div>
);

// Experience Tab Component
const ExperienceTab = ({ data, onAdd, onRemove, onUpdate, onSave, isSaving }) => (
    <div className="tab-content">
        <div className="section-header">
            <h3>Expérience professionnelle</h3>
            <button onClick={onAdd} className="btn-add" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Ajouter une expérience
            </button>
        </div>

        {data.length === 0 ? (
            <div className="empty-state">
                <p>Aucune expérience ajoutée. Cliquez sur "Ajouter une expérience" pour commencer.</p>
            </div>
        ) : (
            <div className="dynamic-list">
                {data.map((exp, index) => (
                    <div key={index} className="list-item">
                        <div className="item-header">
                            <span className="item-number">Expérience #{index + 1}</span>
                            <button onClick={() => onRemove(index)} className="btn-remove" type="button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                Supprimer
                            </button>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Entreprise</label>
                                <input
                                    type="text"
                                    value={exp.company}
                                    onChange={(e) => onUpdate(index, 'company', e.target.value)}
                                    placeholder="Google"
                                />
                            </div>

                            <div className="form-group">
                                <label>Poste</label>
                                <input
                                    type="text"
                                    value={exp.position}
                                    onChange={(e) => onUpdate(index, 'position', e.target.value)}
                                    placeholder="Développeur Full Stack"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Localisation</label>
                            <input
                                type="text"
                                value={exp.location}
                                onChange={(e) => onUpdate(index, 'location', e.target.value)}
                                placeholder="Paris, France"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Date de début</label>
                                <input
                                    type="month"
                                    value={exp.startDate}
                                    onChange={(e) => onUpdate(index, 'startDate', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Date de fin</label>
                                <input
                                    type="month"
                                    value={exp.endDate}
                                    onChange={(e) => onUpdate(index, 'endDate', e.target.value)}
                                    disabled={exp.current}
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={exp.current}
                                        onChange={(e) => onUpdate(index, 'current', e.target.checked)}
                                    />
                                    Poste actuel
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Responsabilités (optionnel)</label>
                            <textarea
                                value={exp.responsibilities.join('\n')}
                                onChange={(e) => onUpdate(index, 'responsibilities', e.target.value.split('\n').filter(r => r.trim()))}
                                placeholder="- Développement d'applications web&#10;- Gestion de projet&#10;- Code review"
                                rows="4"
                                className="textarea-input"
                            />
                            <small>Une responsabilité par ligne</small>
                        </div>

                        <div className="form-group">
                            <label>Réalisations (optionnel)</label>
                            <textarea
                                value={exp.achievements.join('\n')}
                                onChange={(e) => onUpdate(index, 'achievements', e.target.value.split('\n').filter(a => a.trim()))}
                                placeholder="- Augmentation de 30% des performances&#10;- Réduction des bugs de 50%"
                                rows="3"
                                className="textarea-input"
                            />
                            <small>Une réalisation par ligne</small>
                        </div>
                    </div>
                ))}
            </div>
        )}

        <button onClick={onSave} className="btn-primary" disabled={isSaving} type="button">
            {isSaving ? (
                <>
                    <span className="spinner-small"></span>
                    Enregistrement...
                </>
            ) : (
                'Enregistrer'
            )}
        </button>
    </div>
);

// Skills Tab Component
const SkillsTab = ({ data, onAddTechnical, onRemoveTechnical, onUpdateTechnical, onAddSoft, onRemoveSoft, onUpdateSoft, onSave, isSaving }) => {
    const categories = ['Frontend', 'Backend', 'Mobile', 'Database', 'DevOps', 'Testing', 'Design', 'Other'];
    const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

    return (
        <div className="tab-content">
            {/* Technical Skills */}
            <div className="form-section">
                <div className="section-header">
                    <h3>Compétences techniques</h3>
                    <button onClick={onAddTechnical} className="btn-add" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Ajouter
                    </button>
                </div>

                {data.technical.length === 0 ? (
                    <div className="empty-state">
                        <p>Aucune compétence technique ajoutée.</p>
                    </div>
                ) : (
                    <div className="skills-grid">
                        {data.technical.map((skill, index) => (
                            <div key={index} className="skill-item">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        value={skill.name}
                                        onChange={(e) => onUpdateTechnical(index, 'name', e.target.value)}
                                        placeholder="React"
                                        className="skill-name-input"
                                    />
                                </div>

                                <div className="skill-meta">
                                    <select
                                        value={skill.category}
                                        onChange={(e) => onUpdateTechnical(index, 'category', e.target.value)}
                                        className="skill-select"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={skill.proficiency}
                                        onChange={(e) => onUpdateTechnical(index, 'proficiency', e.target.value)}
                                        className="skill-select"
                                    >
                                        {proficiencyLevels.map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>

                                    <button onClick={() => onRemoveTechnical(index)} className="btn-icon-remove" type="button">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Soft Skills */}
            <div className="form-section">
                <div className="section-header">
                    <h3>Compétences comportementales</h3>
                    <button onClick={onAddSoft} className="btn-add" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Ajouter
                    </button>
                </div>

                {data.soft.length === 0 ? (
                    <div className="empty-state">
                        <p>Aucune compétence comportementale ajoutée.</p>
                    </div>
                ) : (
                    <div className="skills-grid">
                        {data.soft.map((skill, index) => (
                            <div key={index} className="skill-item">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        value={skill.name}
                                        onChange={(e) => onUpdateSoft(index, 'name', e.target.value)}
                                        placeholder="Leadership"
                                        className="skill-name-input"
                                    />
                                </div>

                                <div className="skill-meta">
                                    <select
                                        value={skill.proficiency}
                                        onChange={(e) => onUpdateSoft(index, 'proficiency', e.target.value)}
                                        className="skill-select"
                                    >
                                        {proficiencyLevels.map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>

                                    <button onClick={() => onRemoveSoft(index)} className="btn-icon-remove" type="button">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button onClick={onSave} className="btn-primary" disabled={isSaving} type="button">
                {isSaving ? (
                    <>
                        <span className="spinner-small"></span>
                        Enregistrement...
                    </>
                ) : (
                    'Enregistrer'
                )}
            </button>
        </div>
    );
};

export default ProfilePage;
