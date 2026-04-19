import { useState, useEffect } from 'react';
import api from '../api/axios';
import { critiqueProfile } from '../api/profileCritiqueApi';
import { createTodo } from '../api/todosApi';

const ProfileCritiquePage = () => {
    const [jobApplications, setJobApplications] = useState([]);
    const [selectedApplicationId, setSelectedApplicationId] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingApplications, setLoadingApplications] = useState(true);
    const [critique, setCritique] = useState(null);
    const [error, setError] = useState(null);
    const [addingToTodo, setAddingToTodo] = useState({});

    // Fetch job applications on mount
    useEffect(() => {
        const fetchJobApplications = async () => {
            try {
                const response = await api.get('/job-applications');
                setJobApplications(response.data.data || []);
            } catch (err) {
                console.error('Error fetching job applications:', err);
                setError('Impossible de charger les candidatures. Veuillez réessayer.');
            } finally {
                setLoadingApplications(false);
            }
        };

        fetchJobApplications();
    }, []);

    const handleCritiqueProfile = async () => {
        if (!selectedApplicationId) {
            setError('Veuillez sélectionner une candidature.');
            return;
        }

        setLoading(true);
        setError(null);
        setCritique(null);

        try {
            const response = await critiqueProfile(selectedApplicationId);
            if (response.success) {
                setCritique(response.data.critique);
            } else {
                setError('Erreur lors de la critique du profil.');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Une erreur est survenue lors de la communication avec le serveur.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToTodo = async (point, type) => {
        const todoKey = `${type}-${point.label}`;
        setAddingToTodo({ ...addingToTodo, [todoKey]: true });

        try {
            // Determine priority based on type and score
            let priority = 'Medium';
            if (type === 'weak_points' || (point.note && point.note < 40)) {
                priority = 'High';
            } else if (type === 'strong_points' || (point.note && point.note >= 70)) {
                priority = 'Low';
            }

            const todoData = {
                title: `Améliorer: ${point.label}`,
                category: 'Skill Gap',
                priority: priority,
                relatedSkill: point.label,
                description: point.proof || ''
            };

            await createTodo(todoData);
            alert(`✅ "${point.label}" ajouté à votre liste de tâches!`);
        } catch (error) {
            console.error('Error adding to todo:', error);
            alert('Erreur lors de l\'ajout à la liste de tâches');
        } finally {
            setAddingToTodo({ ...addingToTodo, [todoKey]: false });
        }
    };

    const renderPointCard = (point, type, index) => {
        const todoKey = `${type}-${point.label}`;
        const isAdding = addingToTodo[todoKey];

        let bgColor, textColor, emoji;
        if (type === 'strong_points') {
            bgColor = '#dcfce7';
            textColor = '#16a34a';
            emoji = '✅';
        } else if (type === 'medium_points') {
            bgColor = '#fef3c7';
            textColor = '#d97706';
            emoji = '⚠️';
        } else {
            bgColor = '#fee2e2';
            textColor = '#dc2626';
            emoji = '❌';
        }

        return (
            <div
                key={index}
                style={{
                    backgroundColor: bgColor,
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '0.75rem',
                    border: `1px solid ${textColor}33`
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
                            <strong style={{ color: textColor }}>{point.label}</strong>
                            {point.note !== undefined && (
                                <span
                                    style={{
                                        backgroundColor: textColor,
                                        color: 'white',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {point.note}/100
                                </span>
                            )}
                        </div>
                        {point.proof && (
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#333' }}>
                                {point.proof}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => handleAddToTodo(point, type)}
                        disabled={isAdding}
                        style={{
                            backgroundColor: 'white',
                            border: `1px solid ${textColor}`,
                            color: textColor,
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            cursor: isAdding ? 'not-allowed' : 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            opacity: isAdding ? 0.6 : 1
                        }}
                        title="Ajouter à ma liste de tâches"
                    >
                        {isAdding ? '...' : '+ Todo'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h2>Critiquer mon Profile</h2>
                <p className="subtitle">Obtenez une analyse détaillée de votre profil par l'IA</p>
            </div>

            <div className="content-card">
                <div className="cv-generator-content">
                    {/* Header Icon */}
                    <div className="generator-section">
                        {!critique && (
                            <>
                                <div className="info-icon" style={{ margin: '0 auto 1.5rem' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                    </svg>
                                </div>
                                <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Critique de Profil IA</h3>
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                    Sélectionnez une candidature pour analyser votre profil.
                                </p>
                            </>
                        )}

                        {/* Input Section */}
                        <div className="input-section" style={{ width: '100%', marginBottom: '2rem' }}>
                            <label htmlFor="jobApplication" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Candidature <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            {loadingApplications ? (
                                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Chargement des candidatures...</p>
                            ) : jobApplications.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                    Aucune candidature enregistrée. Veuillez d'abord créer une candidature.
                                </p>
                            ) : (
                                <select
                                    id="jobApplication"
                                    value={selectedApplicationId}
                                    onChange={(e) => setSelectedApplicationId(e.target.value)}
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        backgroundColor: loading ? '#f1f5f9' : 'white',
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <option value="">-- Sélectionnez une candidature --</option>
                                    {jobApplications.map((app) => (
                                        <option key={app._id} value={app._id}>
                                            {app.company} - {app.position} ({app.location || 'Non spécifié'})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>
                                <strong>Erreur:</strong> {error}
                            </div>
                        )}

                        {/* Button */}
                        {!critique && (
                            <button
                                className="btn-primary"
                                onClick={handleCritiqueProfile}
                                disabled={loading}
                                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                        </svg>
                                        Analyse en cours...
                                    </span>
                                ) : (
                                    <>
                                        ⭐ Critiquer mon Profile
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Results Section */}
                    {critique && (
                        <div className="result-section" style={{ marginTop: '0', animation: 'fadeIn 0.5s ease-out' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>Résultats de la Critique</h3>
                                <button
                                    onClick={() => setCritique(null)}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Analyser un autre
                                </button>
                            </div>

                            {/* Overall Score */}
                            {critique.overall_score !== undefined && (
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '1.5rem',
                                    borderRadius: '12px',
                                    marginBottom: '2rem',
                                    border: '2px solid #e2e8f0',
                                    textAlign: 'center'
                                }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#475569' }}>Score Global</h3>
                                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: critique.overall_score >= 70 ? '#16a34a' : critique.overall_score >= 50 ? '#d97706' : '#dc2626' }}>
                                        {critique.overall_score}/100
                                    </div>
                                </div>
                            )}

                            {/* Strong Points */}
                            {critique.strong_points && critique.strong_points.length > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ color: '#16a34a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>✅</span> Points Forts ({critique.strong_points.length})
                                    </h4>
                                    {critique.strong_points.map((point, idx) => renderPointCard(point, 'strong_points', idx))}
                                </div>
                            )}

                            {/* Medium Points */}
                            {critique.medium_points && critique.medium_points.length > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ color: '#d97706', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>⚠️</span> Points Moyens ({critique.medium_points.length})
                                    </h4>
                                    {critique.medium_points.map((point, idx) => renderPointCard(point, 'medium_points', idx))}
                                </div>
                            )}

                            {/* Weak Points */}
                            {critique.weak_points && critique.weak_points.length > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ color: '#dc2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>❌</span> Points Faibles ({critique.weak_points.length})
                                    </h4>
                                    {critique.weak_points.map((point, idx) => renderPointCard(point, 'weak_points', idx))}
                                </div>
                            )}

                            {/* Advice */}
                            {critique.advice && (
                                <div style={{
                                    backgroundColor: '#eff6ff',
                                    padding: '1.5rem',
                                    borderRadius: '12px',
                                    border: '2px solid #3b82f6',
                                    marginTop: '2rem'
                                }}>
                                    <h4 style={{ color: '#1e40af', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>💡</span> Conseil
                                    </h4>
                                    <p style={{ margin: 0, color: '#1e3a8a', lineHeight: '1.6' }}>
                                        {critique.advice}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ProfileCritiquePage;
