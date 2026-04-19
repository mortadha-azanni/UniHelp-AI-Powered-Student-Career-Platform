import { useState, useEffect } from 'react';
import api from '../../api/axios';

const TechnicalQuiz = ({ onExit }) => {
    const [quizMode, setQuizMode] = useState('selectJob'); // 'selectJob', 'loading', 'quiz', 'results', 'error'
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [error, setError] = useState(null);
    const [jobApplications, setJobApplications] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [loadingJobs, setLoadingJobs] = useState(true);

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

    const loadQuestions = async (jobAppId) => {
        setQuizMode('loading');
        setError(null);

        try {
            // Call the LangChain-backed backend API
            const response = await api.post('/technical-interview/questions', { jobApplicationId: jobAppId });

            console.log('Quiz response:', response.data);

            let parsedQuestions = [];

            if (response.data?.questions && Array.isArray(response.data.questions)) {
                parsedQuestions = response.data.questions;
            }

            console.log('Parsed questions:', parsedQuestions.length);

            if (parsedQuestions.length === 0) {
                throw new Error('Aucune question reçue. Vérifiez la console pour plus de détails.');
            }

            setQuestions(parsedQuestions);
            setQuizMode('quiz');
            setCurrentQuestionIndex(0);
            setUserAnswers({});
            setSelectedAnswer(null);
            setShowResult(false);
        } catch (err) {
            console.error('Error fetching questions:', err);
            console.error('Error details:', err.response?.data);
            setError(err.message || 'Erreur lors du chargement des questions. Veuillez réessayer.');
            setQuizMode('error');
        }
    };

    const handleAnswerSelect = (answer) => {
        if (!showResult) {
            setSelectedAnswer(answer);
        }
    };

    const handleSubmit = () => {
        if (selectedAnswer) {
            setUserAnswers({
                ...userAnswers,
                [currentQuestionIndex]: selectedAnswer
            });
            setShowResult(true);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(userAnswers[currentQuestionIndex + 1] || null);
            setShowResult(!!userAnswers[currentQuestionIndex + 1]);
        } else {
            setQuizMode('results');
        }
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach((q, idx) => {
            if (userAnswers[idx] === q.correct_answer) {
                correct++;
            }
        });
        return correct;
    };

    const getOptionText = (option) => {
        if (typeof option === 'string') return option;
        return Object.values(option)[0];
    };

    const resetQuiz = () => {
        setQuizMode('selectJob');
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setSelectedAnswer(null);
        setShowResult(false);
        setError(null);
        setSelectedJobId('');
    };

    // Job Selection State
    if (quizMode === 'selectJob') {
        return (
            <div className="dashboard-page">
                <div className="page-header">
                    <h2>Quiz Technique</h2>
                    <p className="subtitle">Sélectionnez une offre d'emploi pour générer vos questions</p>
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
                                        onClick={() => loadQuestions(selectedJobId)}
                                        disabled={!selectedJobId}
                                        className="btn-primary"
                                        style={{ padding: '0.75rem 2rem', opacity: !selectedJobId ? 0.5 : 1, cursor: !selectedJobId ? 'not-allowed' : 'pointer' }}
                                    >
                                        Générer les questions
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Loading State
    if (quizMode === 'loading') {
        return (
            <div className="dashboard-page">
                <div className="page-header">
                    <h2>Questions Techniques</h2>
                    <p className="subtitle">Chargement des questions...</p>
                </div>
                <div className="content-card">
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                        </svg>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Préparation du quiz...</p>
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
    }

    // Error State
    if (quizMode === 'error') {
        return (
            <div className="dashboard-page">
                <div className="page-header">
                    <h2>Questions Techniques</h2>
                    <p className="subtitle">Erreur de chargement</p>
                </div>
                <div className="content-card">
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            border: '1px solid #fecaca'
                        }}>
                            <strong>Erreur:</strong> {error}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={loadQuestions}
                                className="btn-primary"
                                style={{ padding: '0.75rem 2rem' }}
                            >
                                Réessayer
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
                                Retour
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz State
    if (quizMode === 'quiz' && questions.length > 0) {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = showResult && selectedAnswer === currentQuestion.correct_answer;

        return (
            <div className="dashboard-page">
                <div className="page-header">
                    <h2>Questions Techniques</h2>
                    <p className="subtitle">Question {currentQuestionIndex + 1} sur {questions.length}</p>
                </div>

                <div className="content-card">
                    <div style={{ padding: '2rem' }}>
                        {/* Progress Bar */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Progression</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {Object.keys(userAnswers).length}/{questions.length} répondu
                                </span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '8px',
                                backgroundColor: '#e2e8f0',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                                    height: '100%',
                                    backgroundColor: 'var(--primary-color)',
                                    transition: 'width 0.3s ease'
                                }}></div>
                            </div>
                        </div>

                        {/* Question */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                {currentQuestion.question_text}
                            </h3>

                            {/* Options */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {currentQuestion.options.map((option, idx) => {
                                    const optionText = getOptionText(option);
                                    const isSelected = selectedAnswer === optionText;
                                    const isThisCorrect = optionText === currentQuestion.correct_answer;

                                    let backgroundColor = 'white';
                                    let borderColor = '#cbd5e1';
                                    let textColor = '#1e293b';

                                    if (showResult) {
                                        if (isThisCorrect) {
                                            backgroundColor = '#dcfce7';
                                            borderColor = '#16a34a';
                                            textColor = '#16a34a';
                                        } else if (isSelected && !isThisCorrect) {
                                            backgroundColor = '#fee2e2';
                                            borderColor = '#dc2626';
                                            textColor = '#dc2626';
                                        }
                                    } else if (isSelected) {
                                        backgroundColor = '#eff6ff';
                                        borderColor = 'var(--primary-color)';
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswerSelect(optionText)}
                                            disabled={showResult}
                                            style={{
                                                padding: '1.25rem',
                                                borderRadius: '12px',
                                                border: `2px solid ${borderColor}`,
                                                backgroundColor,
                                                color: textColor,
                                                textAlign: 'left',
                                                cursor: showResult ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s ease',
                                                fontWeight: isSelected ? '600' : '400',
                                                fontSize: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem'
                                            }}
                                        >
                                            <span style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                border: `2px solid ${borderColor}`,
                                                backgroundColor: isSelected ? borderColor : 'white',
                                                color: isSelected ? 'white' : borderColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                flexShrink: 0
                                            }}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span style={{ flex: 1 }}>{optionText}</span>
                                            {showResult && isThisCorrect && (
                                                <span style={{ fontSize: '1.5rem' }}>✓</span>
                                            )}
                                            {showResult && isSelected && !isThisCorrect && (
                                                <span style={{ fontSize: '1.5rem' }}>✗</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Result Message */}
                        {showResult && (
                            <div style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                backgroundColor: isCorrect ? '#dcfce7' : '#fee2e2',
                                border: `1px solid ${isCorrect ? '#16a34a' : '#dc2626'}`,
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>
                                    {isCorrect ? '✅' : '❌'}
                                </span>
                                <span style={{
                                    color: isCorrect ? '#16a34a' : '#dc2626',
                                    fontWeight: 600
                                }}>
                                    {isCorrect
                                        ? 'Bonne réponse !'
                                        : `Mauvaise réponse. La bonne réponse était : "${currentQuestion.correct_answer}"`
                                    }
                                </span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
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
                                Quitter
                            </button>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {!showResult ? (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!selectedAnswer}
                                        className="btn-primary"
                                        style={{
                                            padding: '0.75rem 2rem',
                                            opacity: !selectedAnswer ? 0.5 : 1,
                                            cursor: !selectedAnswer ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        Soumettre
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        className="btn-primary"
                                        style={{ padding: '0.75rem 2rem' }}
                                    >
                                        {currentQuestionIndex < questions.length - 1 ? 'Suivant' : 'Voir les résultats'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Results State
    if (quizMode === 'results') {
        const score = calculateScore();
        const percentage = (score / questions.length) * 100;

        return (
            <div className="dashboard-page">
                <div className="page-header">
                    <h2>Résultats du Quiz</h2>
                    <p className="subtitle">Voici vos performances</p>
                </div>

                <div className="content-card">
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        {/* Score Circle */}
                        <div style={{
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            border: `12px solid ${percentage >= 70 ? '#16a34a' : percentage >= 50 ? '#d97706' : '#dc2626'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 2rem',
                            backgroundColor: '#f8fafc'
                        }}>
                            <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: percentage >= 70 ? '#16a34a' : percentage >= 50 ? '#d97706' : '#dc2626' }}>
                                {score}/{questions.length}
                            </div>
                            <div style={{ fontSize: '1.2rem', color: '#64748b', marginTop: '0.5rem' }}>
                                {percentage.toFixed(0)}%
                            </div>
                        </div>

                        {/* Performance Message */}
                        <h3 style={{ marginBottom: '1rem' }}>
                            {percentage >= 80 ? '🎉 Excellent travail !' :
                                percentage >= 60 ? '👍 Bon travail !' :
                                    percentage >= 40 ? '💪 Continuez à pratiquer !' :
                                        '📚 Besoin de plus de pratique'}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Vous avez répondu correctement à {score} question{score > 1 ? 's' : ''} sur {questions.length}.
                        </p>

                        {/* Detailed Results */}
                        <div style={{
                            textAlign: 'left',
                            backgroundColor: '#f8fafc',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            marginBottom: '2rem'
                        }}>
                            <h4 style={{ marginBottom: '1rem' }}>Détails des réponses</h4>
                            {questions.map((q, idx) => {
                                const isCorrect = userAnswers[idx] === q.correct_answer;
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: '0.75rem',
                                            borderLeft: `4px solid ${isCorrect ? '#16a34a' : '#dc2626'}`,
                                            backgroundColor: 'white',
                                            marginBottom: '0.75rem',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span>{isCorrect ? '✅' : '❌'}</span>
                                            <strong>Question {idx + 1}</strong>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                                            {q.question_text.substring(0, 80)}...
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={resetQuiz}
                                className="btn-primary"
                                style={{ padding: '0.75rem 2rem' }}
                            >
                                Recommencer
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
                                Retour au menu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default TechnicalQuiz;