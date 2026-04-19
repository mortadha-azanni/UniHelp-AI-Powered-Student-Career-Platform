import { useState } from 'react';
import TechnicalQuiz from '../components/interview/TechnicalQuiz';
import TechnicalInterview from '../components/interview/TechnicalInterview';
import HRInterview from '../components/interview/HRInterview';

const InterviewPrepPage = () => {
    const [mode, setMode] = useState(null); // null, 'technical', 'tech-chat', 'hr'

    if (mode === 'technical') {
        return <TechnicalQuiz onExit={() => setMode(null)} />;
    }

    if (mode === 'tech-chat') {
        return <TechnicalInterview onExit={() => setMode(null)} />;
    }

    if (mode === 'hr') {
        return <HRInterview onExit={() => setMode(null)} />;
    }

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h2>Préparation aux entretiens</h2>
                <p className="subtitle">Choisissez votre mode d'entraînement</p>
            </div>

            <div className="content-card">
                <div style={{ padding: '2rem' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem',
                        marginTop: '1rem'
                    }}>
                        {/* Technical Chat Card (New) */}
                        <div style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            backgroundColor: 'white'
                        }}
                            className="hover:shadow-lg hover:border-blue-600"
                        >
                            <div style={{
                                fontSize: '4rem',
                                marginBottom: '1.5rem',
                                background: '#f0f9ff',
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                💻
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>
                                Entretien Technique Chat
                            </h3>
                            <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
                                Un entretien interactif avec une IA qui évalue vos compétences en temps réel.
                            </p>
                            <button
                                onClick={() => setMode('tech-chat')}
                                className="btn-primary"
                                style={{ width: '100%', padding: '1rem', backgroundColor: '#2563eb' }}
                            >
                                Commencer l'Entretien
                            </button>
                        </div>

                        {/* Technical Quiz Card */}
                        <div style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            backgroundColor: 'white'
                        }}
                            className="hover:shadow-lg hover:border-blue-400"
                        >
                            <div style={{
                                fontSize: '4rem',
                                marginBottom: '1.5rem',
                                background: '#eff6ff',
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                🧠
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>
                                Quiz Technique (QCM)
                            </h3>
                            <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
                                Testez vos connaissances avec des QCM générés par IA adaptés à votre profil.
                            </p>
                            <button
                                onClick={() => setMode('technical')}
                                className="btn-primary"
                                style={{ width: '100%', padding: '1rem' }}
                            >
                                Démarrer le Quiz
                            </button>
                        </div>

                        {/* HR Interview Card */}
                        <div style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            backgroundColor: 'white'
                        }}
                            className="hover:shadow-lg hover:border-indigo-400"
                        >
                            <div style={{
                                fontSize: '4rem',
                                marginBottom: '1.5rem',
                                background: '#f5f3ff',
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                🤝
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>
                                Entretien RH
                            </h3>
                            <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
                                Simulez un entretien comportemental avec notre chatbot RH intelligent.
                            </p>
                            <button
                                onClick={() => setMode('hr')}
                                className="btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    backgroundColor: '#4f46e5'
                                }}
                            >
                                Démarrer l'Entretien
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewPrepPage;

