import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';

const HRInterview = ({ onExit }) => {
    const [status, setStatus] = useState('chat'); // 'chat', 'results'
    const [hrConversation, setHrConversation] = useState([]);
    const [hrCurrentStep, setHrCurrentStep] = useState(0);
    const [hrUserInput, setHrUserInput] = useState('');
    const [hrSessionId] = useState(`user-${Date.now()}`);
    const [hrLoading, setHrLoading] = useState(false);
    const [hrSummary, setHrSummary] = useState(null);
    const [error, setError] = useState(null);
    const conversationContainerRef = useRef(null);

    const hasStartedRef = useRef(false);

    // Initial start
    useEffect(() => {
        if (!hasStartedRef.current) {
            hasStartedRef.current = true;
            sendHRMessage('start', 0);
        }
    }, []);

    // Auto-scroll conversation container to bottom when new messages arrive
    useEffect(() => {
        if (conversationContainerRef.current) {
            conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
        }
    }, [hrConversation]);

    const sendHRMessage = async (message, step) => {
        setHrLoading(true);
        setError(null);

        try {
            // Call our backend API
            console.log('Sending HR message:', { sessionId: hrSessionId, message, step });
            const response = await api.post('/hr-interview', {
                sessionId: hrSessionId,
                message: message,
                step: step,
                history: hrConversation.map(c => ({ type: c.type, message: c.message }))
            });

            console.log('HR Response:', response.data);

            let parsedResponse = null;

            // Parse response - could be object, string, or array
            if (typeof response.data === 'string') {
                try {
                    parsedResponse = JSON.parse(response.data);
                } catch (e) {
                    console.error('Failed to parse string response:', e);
                }
            } else if (Array.isArray(response.data) && response.data.length > 0) {
                // Last step returns array with output
                parsedResponse = response.data[0].output;
            } else {
                parsedResponse = response.data;
            }

            console.log('Parsed HR Response:', parsedResponse);

            if (!parsedResponse) {
                throw new Error('Invalid response format');
            }

            // Add bot message to conversation
            if (parsedResponse.botMessage) {
                setHrConversation(prev => [
                    ...prev,
                    {
                        type: 'bot',
                        message: parsedResponse.botMessage,
                        feedback: parsedResponse.feedback || '',
                        step: parsedResponse.step
                    }
                ]);
            }

            // Update step
            setHrCurrentStep(parsedResponse.step || 0);

            // Check if interview is done
            if (parsedResponse.done && parsedResponse.summary) {
                setHrSummary(parsedResponse.summary);
                setStatus('results');
            }

            setHrLoading(false);
        } catch (err) {
            console.error('HR Interview error:', err);
            setError('Erreur lors de la communication avec le serveur. Veuillez réessayer.');
            setHrLoading(false);
        }
    };

    const handleHRSubmit = async () => {
        if (!hrUserInput.trim()) return;

        const userMessage = hrUserInput;

        // Add user message to conversation IMMEDIATELY
        setHrConversation(prev => [
            ...prev,
            {
                type: 'user',
                message: userMessage,
                step: hrCurrentStep
            }
        ]);

        setHrUserInput('');

        // Send message to bot
        await sendHRMessage(userMessage, hrCurrentStep);
    };

    const restartInterview = () => {
        setHrConversation([]);
        setHrCurrentStep(0);
        setHrUserInput('');
        setHrSummary(null);
        setError(null);
        setStatus('chat');
        sendHRMessage('start', 0);
    };

    if (status === 'results' && hrSummary) {
        const averageScore = Object.values(hrSummary).reduce((a, b) => a + b, 0) / Object.values(hrSummary).length;

        return (
            <div className="dashboard-page">
                <div className="page-header">
                    <h2>Résultats de l'Entretien RH</h2>
                    <p className="subtitle">Votre évaluation est terminée</p>
                </div>

                <div className="content-card">
                    <div style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                        {/* Success Icon */}
                        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>
                            {averageScore >= 4.5 ? '🎉' :
                                averageScore >= 4 ? '👍' :
                                    averageScore >= 3 ? '👌' :
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
                                    ? "Excellente performance ! Vous démontrez de solides compétences comportementales et de communication. Vos réponses étaient claires et structurées."
                                    : averageScore >= 3
                                        ? "Bonne performance ! Vous avez montré de bonnes bases en compétences comportementales. Continuez à pratiquer pour parfaire vos réponses."
                                        : "Vous avez besoin de plus de pratique pour améliorer vos compétences d'entretien. N'hésitez pas à recommencer et à structurer davantage vos réponses."}
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
                <h2>Entretien RH</h2>
                <p className="subtitle">Conversez avec notre assistant RH IA</p>
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
                            {hrConversation.length === 0 && !hrLoading && (
                                <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem', margin: 'auto' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Entretien RH Interactif</p>
                                    <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Cliquez sur "Démarrer" pour commencer</p>
                                </div>
                            )}

                            {hrConversation.map((msg, idx) => (
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
                                                    🤖 Assistant RH
                                                </div>
                                            )}
                                            {msg.message}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {hrLoading && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b' }}>
                                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                    </svg>
                                    <span>L'assistant réfléchit...</span>
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

                            {/* Input or Start Button */}
                            {hrConversation.length > 0 ? (
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                                    <textarea
                                        value={hrUserInput}
                                        onChange={(e) => setHrUserInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleHRSubmit();
                                            }
                                        }}
                                        placeholder="Tapez votre réponse ici..."
                                        disabled={hrLoading}
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
                                            backgroundColor: hrLoading ? '#f1f5f9' : 'white'
                                        }}
                                    />
                                    <button
                                        onClick={handleHRSubmit}
                                        disabled={hrLoading || !hrUserInput.trim()}
                                        className="btn-primary"
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            opacity: (hrLoading || !hrUserInput.trim()) ? 0.5 : 1,
                                            cursor: (hrLoading || !hrUserInput.trim()) ? 'not-allowed' : 'pointer',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {hrLoading ? '...' : 'Envoyer →'}
                                    </button>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <button
                                        onClick={() => sendHRMessage('start', 0)}
                                        className="btn-primary"
                                        disabled={hrLoading}
                                        style={{
                                            padding: '0.75rem 2.5rem',
                                            fontSize: '1rem',
                                            opacity: hrLoading ? 0.6 : 1
                                        }}
                                    >
                                        {hrLoading ? 'Démarrage...' : '🚀 Démarrer l\'entretien'}
                                    </button>
                                </div>
                            )}
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

export default HRInterview;
