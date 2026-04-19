import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';

const TechnicalInterview = ({ onExit }) => {
    const [quizMode, setQuizMode] = useState('selectJob'); // 'selectJob', 'chat', 'results'
    const [conversation, setConversation] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [sessionId] = useState(`tech-user-${Date.now()}`);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);
    const [jobApplications, setJobApplications] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [loadingJobs, setLoadingJobs] = useState(true);
    const conversationContainerRef = useRef(null);

    // Fetch job applications on mount
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await api.get('/job-applications');
                const apps = response.data?.data || response.data || [];
                setJobApplications(apps);
            } catch (err) {
                console.error('Error fetching job applications:', err);
                setJobApplications([]);
            } finally {
                setLoadingJobs(false);
            }
        };
        fetchJobs();
    }, []);

    // Auto-scroll conversation container to bottom
    useEffect(() => {
        if (conversationContainerRef.current) {
            conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
        }
    }, [conversation]);

    const startChat = (jobId) => {
        setSelectedJobId(jobId);
        setQuizMode('chat');
        sendMessage('start', 0, jobId);
    };

    const sendMessage = async (message, step, jobId = selectedJobId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/technical-interview/chat', {
                sessionId,
                message,
                step,
                history: conversation.map(c => ({ type: c.type, message: c.message })),
                jobApplicationId: jobId
            });

            console.log('Tech Chat Response:', response.data);

            let data = null;
            if (typeof response.data === 'string') {
                try {
                    data = JSON.parse(response.data);
                } catch (e) {
                    console.error('Failed to parse string response:', e);
                }
            } else if (Array.isArray(response.data) && response.data.length > 0) {
                data = response.data[0].output;
            } else {
                data = response.data;
            }

            if (!data) throw new Error('Invalid response format');

            if (data.botMessage) {
                setConversation(prev => [
                    ...prev,
                    {
                        type: 'bot',
                        message: data.botMessage,
                        feedback: data.feedback || '',
                        step: data.step
                    }
                ]);
            }

            setCurrentStep(data.step || 0);

            if (data.done && data.summary) {
                setSummary(data.summary);
                setQuizMode('results');
            }

            setLoading(false);
        } catch (err) {
            console.error('Tech Interview error:', err);
            setError('Erreur lors de la communication avec le serveur. Veuillez réessayer.');
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!userInput.trim()) return;

        const userMsg = userInput;
        setConversation(prev => [
            ...prev,
            { type: 'user', message: userMsg, step: currentStep }
        ]);
        setUserInput('');

        await sendMessage(userMsg, currentStep);
    };

    const restartInterview = () => {
        setConversation([]);
        setCurrentStep(0);
        setUserInput('');
        setSummary(null);
        setError(null);
        setQuizMode('selectJob');
        setSelectedJobId('');
    };

    if (quizMode === 'selectJob') {
        return (
            <div className="dashboard-page">
                <div className="page-header">
                    <h2>Entretien Technique</h2>
                    <p className="subtitle">Sélectionnez une offre pour commencer la simulation</p>
                </div>
                <div className="content-card">
                    <div style={{ padding: '2rem' }}>
                        {loadingJobs ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Chargement des offres...</p>
                        ) : jobApplications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                                    Aucune candidature trouvée. Ajoutez d'abord une candidature.
                                </p>
                                <button onClick={onExit} className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
                                    Retour
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                        Offre d'emploi
                                    </label>
                                    <select
                                        value={selectedJobId}
                                        onChange={(e) => setSelectedJobId(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '1rem',
                                            backgroundColor: 'white'
                                        }}
                                    >
                                        <option value="">-- Sélectionner --</option>
                                        {jobApplications.map((app) => (
                                            <option key={app._id} value={app._id}>
                                                {app.position} @ {app.company}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button onClick={onExit} style={{
                                        padding: '0.75rem 2rem', borderRadius: '8px',
                                        border: '1px solid #cbd5e1', backgroundColor: 'white',
                                        color: '#475569', cursor: 'pointer', fontWeight: 600
                                    }}>
                                        Annuler
                                    </button>
                                    <button
                                        onClick={() => startChat(selectedJobId)}
                                        disabled={!selectedJobId}
                                        className="btn-primary"
                                        style={{ padding: '0.75rem 2rem', opacity: !selectedJobId ? 0.5 : 1, cursor: !selectedJobId ? 'not-allowed' : 'pointer' }}
                                    >
                                        Démarrer l'entretien
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (quizMode === 'results' && summary) {
        const averageScore = (summary.technical_accuracy + summary.communication + summary.problem_solving) / 3;

        return (
            <div className="dashboard-page">
                <div className="page-header">
                    <h2>Résultats de l'Entretien Technique</h2>
                    <p className="subtitle">Votre évaluation est terminée</p>
                </div>

                <div className="content-card">
                    <div style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                        {/* Success Icon */}
                        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>
                            {averageScore >= 4.5 ? '🎉' :
                                averageScore >= 4 ? '🏅' :
                                    averageScore >= 3 ? '👍' :
                                        '💪'}
                        </div>

                        {/* Overall Score */}
                        <div style={{
                            backgroundColor: '#f8fafc',
                            padding: '2.5rem',
                            borderRadius: '16px',
                            border: '2px solid #e2e8f0',
                            marginBottom: '2rem'
                        }}>
                            <h3 style={{ marginBottom: '1rem', color: '#475569', fontSize: '1.2rem' }}>Votre Score</h3>
                            <div style={{
                                fontSize: '5rem',
                                fontWeight: 'bold',
                                color: averageScore >= 4 ? '#16a34a' : averageScore >= 3 ? '#d97706' : '#dc2626',
                                marginBottom: '0.5rem'
                            }}>
                                {averageScore.toFixed(1)}/5
                            </div>

                            {/* Star Rating */}
                            <div style={{ fontSize: '2rem', margin: '1rem 0' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star}>
                                        {star <= Math.round(averageScore) ? '⭐' : '☆'}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Detailed Scores */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                                <div style={{ fontSize: '0.9rem', color: '#1e40af', marginBottom: '0.5rem', fontWeight: 600 }}>Technique</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1d4ed8' }}>{summary.technical_accuracy}/5</div>
                            </div>
                            <div style={{ padding: '1rem', background: '#f5f3ff', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
                                <div style={{ fontSize: '0.9rem', color: '#5b21b6', marginBottom: '0.5rem', fontWeight: 600 }}>Communication</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6d28d9' }}>{summary.communication}/5</div>
                            </div>
                            <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                                <div style={{ fontSize: '0.9rem', color: '#065f46', marginBottom: '0.5rem', fontWeight: 600 }}>Raisonnement</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#047857' }}>{summary.problem_solving}/5</div>
                            </div>
                        </div>

                        {/* Performance Message */}
                        <div style={{
                            backgroundColor: '#eff6ff',
                            padding: '2rem',
                            borderRadius: '12px',
                            border: '2px solid #3b82f6',
                            marginBottom: '2rem'
                        }}>
                            <h4 style={{ color: '#1e40af', marginBottom: '1rem', fontSize: '1.3rem' }}>
                                {averageScore >= 4.5 ? 'Excellent travail !' :
                                    averageScore >= 4 ? 'Très bien !' :
                                        averageScore >= 3 ? 'Bon résultat !' :
                                            'Continuez à pratiquer !'}
                            </h4>
                            <p style={{ margin: 0, color: '#1e3a8a', lineHeight: '1.6', fontSize: '1.05rem' }}>
                                {averageScore >= 4
                                    ? "Excellente performance ! Vous maîtrisez bien les concepts techniques demandés."
                                    : averageScore >= 3
                                        ? "Bonne base technique ! Quelques révisions profondes sur certains sujets pourraient vous aider à exceller."
                                        : "Il semble qu'il y ait des lacunes à combler. N'hésitez pas à cibler vos révisions sur les points bloquants de cette simulation."}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={restartInterview}
                                className="btn-primary"
                                style={{ padding: '0.75rem 2rem' }}
                            >
                                🔄 Recommencer
                            </button>
                            <button
                                onClick={onExit}
                                style={{
                                    padding: '0.75rem 2rem',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    backgroundColor: 'white',
                                    color: '#475569',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                ← Retour au menu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Chat UI
    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h2>Entretien Technique</h2>
                <p className="subtitle">Simulation conversationnelle</p>
            </div>

            <div className="content-card">
                <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                    {/* Chat Container with Input Inside */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '600px'
                    }}>
                        {/* Conversation Area (Scrollable) */}
                        <div
                            ref={conversationContainerRef}
                            style={{
                                flex: 1,
                                padding: '1.5rem',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            {conversation.length === 0 && !loading && (
                                <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem', margin: 'auto' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Entretien Technique</p>
                                    <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>L'interviewer vous posera bientôt la première question.</p>
                                </div>
                            )}

                            {conversation.map((msg, idx) => (
                                <div key={idx} style={{ marginBottom: '1.5rem' }}>
                                    {/* Feedback from previous question */}
                                    {msg.type === 'bot' && msg.feedback && (
                                        <div style={{
                                            backgroundColor: '#dcfce7',
                                            border: '1px solid #16a34a',
                                            borderRadius: '8px',
                                            padding: '0.75rem 1rem',
                                            marginBottom: '1rem',
                                            fontSize: '0.9rem',
                                            color: '#166534'
                                        }}>
                                            <strong>✓ Feedback:</strong> {msg.feedback}
                                        </div>
                                    )}

                                    {/* Message bubble */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: msg.type === 'bot' ? 'flex-start' : 'flex-end',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <div style={{
                                            maxWidth: '75%',
                                            padding: '1rem 1.25rem',
                                            borderRadius: msg.type === 'bot' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                                            backgroundColor: msg.type === 'bot' ? '#eff6ff' : '#4f46e5',
                                            color: msg.type === 'bot' ? '#1e293b' : 'white',
                                            border: msg.type === 'bot' ? '1px solid #3b82f6' : 'none',
                                            lineHeight: '1.5',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word'
                                        }}>
                                            {msg.type === 'bot' && (
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>
                                                    🤖 Interviewer Technique
                                                </div>
                                            )}
                                            {msg.message}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b' }}>
                                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                    </svg>
                                    <span>L'interviewer réfléchit...</span>
                                </div>
                            )}
                        </div>

                        {/* Input Area - Fixed at Bottom Inside Container */}
                        <div style={{
                            borderTop: '1px solid #e2e8f0',
                            padding: '1rem 1.5rem',
                            backgroundColor: 'white',
                            borderRadius: '0 0 12px 12px'
                        }}>
                            {/* Error Message */}
                            {error && (
                                <div style={{
                                    padding: '0.75rem',
                                    backgroundColor: '#fee2e2',
                                    color: '#dc2626',
                                    borderRadius: '8px',
                                    marginBottom: '1rem',
                                    border: '1px solid #fecaca',
                                    fontSize: '0.9rem'
                                }}>
                                    <strong>Erreur:</strong> {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                                <textarea
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit();
                                        }
                                    }}
                                    placeholder="Tapez votre réponse ici..."
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem 1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit',
                                        resize: 'none',
                                        minHeight: '60px',
                                        maxHeight: '120px',
                                        backgroundColor: loading ? '#f1f5f9' : 'white'
                                    }}
                                />
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !userInput.trim()}
                                    className="btn-primary"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        opacity: (loading || !userInput.trim()) ? 0.5 : 1,
                                        cursor: (loading || !userInput.trim()) ? 'not-allowed' : 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {loading ? '...' : 'Envoyer →'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Back Button */}
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <button
                            onClick={onExit}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: 'white',
                                color: '#475569',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            ← Retour au menu
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default TechnicalInterview;

