import { useState } from 'react';

const CalendarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const SparklesIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
const LoaderIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

const ScheduleGeneratorModal = ({ onGenerate, onClose, isGenerating }) => {
    const [hoursPerDay, setHoursPerDay] = useState(2);
    const [targetTimeframe, setTargetTimeframe] = useState('1 mois');
    const [familiarityLevel, setFamiliarityLevel] = useState('Débutant');

    const handleGenerate = () => {
        onGenerate({ hoursPerDay, targetTimeframe, familiarityLevel });
    };

    const inputStyle = {
        width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
        border: '1px solid #3f3f46', background: '#09090b', color: '#f4f4f5',
        fontSize: '0.95rem', boxSizing: 'border-box',
        transition: 'border-color 0.2s', outline: 'none', appearance: 'none'
    };

    const labelStyle = { 
        display: 'block', fontSize: '0.85rem', fontWeight: '500', 
        color: '#e4e4e7', marginBottom: '0.5rem' 
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(9, 9, 11, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', padding: '2.5rem', borderRadius: '16px', width: '90%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.5rem', borderRadius: '8px' }}>
                            <CalendarIcon />
                        </div>
                        <h2 style={{ margin: 0, color: '#f4f4f5', fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em' }}>
                            Générer un Programme
                        </h2>
                    </div>
                    <button 
                        onClick={onClose} disabled={isGenerating}
                        style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem' }}
                    >×</button>
                </div>

                <p style={{ color: '#a1a1aa', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.5' }}>
                    L'IA va analyser votre Roadmap et créer un emploi du temps personnalisé jour par jour pour vous aider à atteindre vos objectifs.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}>Temps disponible par jour</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="number" min="0.5" step="0.5" max="12"
                                value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)}
                                disabled={isGenerating} style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                            />
                            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#71717a', pointerEvents: 'none', fontSize: '0.85rem' }}>
                                heure(s)
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Durée cible souhaitée</label>
                        <select
                            value={targetTimeframe} onChange={(e) => setTargetTimeframe(e.target.value)}
                            disabled={isGenerating} style={{ ...inputStyle, cursor: 'pointer' }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                        >
                            <option value="1 semaine">1 semaine (Intensif)</option>
                            <option value="2 semaines">2 semaines</option>
                            <option value="1 mois">1 mois (Recommandé)</option>
                            <option value="3 mois">3 mois (À mon rythme)</option>
                            <option value="6 mois">6 mois</option>
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>Niveau de familiarité préalable</label>
                        <select
                            value={familiarityLevel} onChange={(e) => setFamiliarityLevel(e.target.value)}
                            disabled={isGenerating} style={{ ...inputStyle, cursor: 'pointer' }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                        >
                            <option value="Débutant total">Non, je pars de zéro</option>
                            <option value="Connaissances de base">J'ai quelques notions</option>
                            <option value="Intermédiaire">Je connais déjà pas mal de choses</option>
                            <option value="Avancé">Je veux juste une révision rapide</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2.5rem' }}>
                    <button 
                        onClick={onClose} disabled={isGenerating}
                        style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid #3f3f46', borderRadius: '8px', cursor: 'pointer', color: '#a1a1aa', fontWeight: '500', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => !isGenerating && (e.currentTarget.style.color = '#f4f4f5')}
                        onMouseLeave={(e) => !isGenerating && (e.currentTarget.style.color = '#a1a1aa')}
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={handleGenerate} disabled={isGenerating}
                        style={{ padding: '0.6rem 1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: isGenerating ? 'not-allowed' : 'pointer', fontWeight: '500', opacity: isGenerating ? 0.7 : 1, transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onMouseEnter={(e) => !isGenerating && (e.currentTarget.style.background = '#60a5fa')}
                        onMouseLeave={(e) => !isGenerating && (e.currentTarget.style.background = '#3b82f6')}
                    >
                        {isGenerating ? <><LoaderIcon /> Analyse en cours...</> : <><SparklesIcon /> Générer Planning</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleGeneratorModal;
