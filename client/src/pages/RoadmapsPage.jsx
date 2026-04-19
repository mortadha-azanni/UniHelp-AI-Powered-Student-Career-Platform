import { useState, useEffect } from 'react';
import { getRoadmaps, createRoadmap, deleteRoadmap, generateRoadmapAI } from '../api/roadmapService';
import RoadmapBuilder from '../components/roadmap/RoadmapBuilder';

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const SparklesIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>;
const MapIcon = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>;
const GlobeIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const LockIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const TargetIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const LoaderIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

const RoadmapsPage = () => {
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRoadmap, setActiveRoadmap] = useState(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [roadmapToDelete, setRoadmapToDelete] = useState(null);
    const [goal, setGoal] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState(null);

    const fetchRoadmaps = async () => {
        setLoading(true);
        try {
            const data = await getRoadmaps();
            setRoadmaps(data);
        } catch (error) {
            console.error('Failed to fetch roadmaps', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Add minimal spinner CSS
        const keyframes = `
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `;
        const styleId = 'roadmap-minimal-animations';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = keyframes;
            document.head.appendChild(style);
        }

        fetchRoadmaps();

        // Check if we came from Todo section to generate a roadmap
        const searchParams = new URLSearchParams(window.location.search);
        const todoObjective = searchParams.get('todoObjective');
        if (todoObjective) {
            setGoal(todoObjective);
            setShowGenerateModal(true);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleCreateNew = async () => {
        try {
            const newRM = await createRoadmap({
                title: 'Nouveau parcours',
                description: 'Description de votre apprentissage.',
                category: 'Development',
                difficulty: 'Beginner'
            });
            setRoadmaps([newRM, ...roadmaps]);
            setActiveRoadmap(newRM);
        } catch (error) {
            console.error('Failed to create roadmap', error);
        }
    };

    const confirmDelete = async () => {
        if (!roadmapToDelete) return;
        try {
            await deleteRoadmap(roadmapToDelete);
            setRoadmaps(roadmaps.filter(rm => rm._id !== roadmapToDelete));
            setRoadmapToDelete(null);
        } catch (error) {
            console.error('Failed to delete roadmap', error);
        }
    };

    const handleGenerateMap = async () => {
        if (!goal.trim()) return;
        setIsGenerating(true);
        setGenerationError(null);
        try {
            const newRM = await generateRoadmapAI({ goal });
            if (!newRM || !newRM._id) throw new Error('Réponse invalide du serveur');
            setRoadmaps(prev => [newRM, ...prev]);
            setShowGenerateModal(false);
            setGoal('');
            setActiveRoadmap(newRM);
        } catch (error) {
            console.error('Failed to generate roadmap:', error);
            setGenerationError(error?.response?.data?.message || error?.message || 'Erreur inconnue');
        } finally {
            setIsGenerating(false);
        }
    };

    if (activeRoadmap) {
        return (
            <div style={{ height: 'calc(100vh - 64px)' }}>
                <RoadmapBuilder
                    roadmap={activeRoadmap}
                    onBack={() => {
                        setActiveRoadmap(null);
                        fetchRoadmaps();
                    }}
                />
            </div>
        );
    }

    return (
        <div style={{ 
            fontFamily: "'Inter', sans-serif", 
            minHeight: '100%', 
            padding: '2rem 3rem',
            background: '#09090b',
            color: '#f4f4f5'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '700', letterSpacing: '-0.03em', margin: '0 0 0.5rem 0', color: '#ffffff' }}>
                        Roadmaps
                    </h2>
                    <p style={{ color: '#a1a1aa', fontSize: '1rem', margin: 0, letterSpacing: '-0.01em' }}>
                        Visualisez et suivez votre apprentissage génératif.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setShowGenerateModal(true)}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.15)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.08)'; }}
                        style={{ 
                            padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', 
                            backgroundColor: 'rgba(168, 85, 247, 0.08)', color: '#c084fc', 
                            border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '8px', 
                            cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem',
                            transition: 'all 0.2s ease', backdropFilter: 'blur(4px)'
                        }}
                    >
                        <SparklesIcon /> Générer
                    </button>
                    <button 
                        onClick={handleCreateNew} 
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
                        style={{ 
                            padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', 
                            backgroundColor: '#3b82f6', color: 'white', 
                            border: '1px solid transparent', borderRadius: '8px', 
                            cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem',
                            transition: 'all 0.2s ease', 
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)' 
                        }}
                    >
                        <PlusIcon /> Créer
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#a1a1aa' }}>
                        <LoaderIcon /> Chargement des roadmaps...
                    </div>
                ) : roadmaps.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '6rem 2rem', color: '#71717a', border: '1px dashed #27272a', borderRadius: '12px', background: '#09090b' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <MapIcon />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', color: '#e4e4e7', fontWeight: '600', marginBottom: '0.5rem' }}>Aucune roadmap trouvée</h3>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>Créez votre premier parcours d'apprentissage interactif.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {roadmaps.map((roadmap, i) => (
                            <div
                                key={roadmap._id}
                                onClick={() => setActiveRoadmap(roadmap)}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#52525b'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                style={{
                                    border: '1px solid #27272a',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    backgroundColor: '#18181b',
                                    position: 'relative',
                                    animation: `fadeIn 0.4s ease forwards ${i * 0.05}s`,
                                    opacity: 0,
                                }}
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); setRoadmapToDelete(roadmap._id); }}
                                    style={{ 
                                        position: 'absolute', top: '1rem', right: '1rem', 
                                        background: 'transparent', border: 'none', cursor: 'pointer', 
                                        color: '#71717a', padding: '0.4rem', borderRadius: '6px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        transition: 'all 0.2s' 
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#71717a'; }}
                                    title="Supprimer"
                                >
                                    <TrashIcon />
                                </button>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#f4f4f5', fontSize: '1.15rem', fontWeight: '600', paddingRight: '2rem', letterSpacing: '-0.01em' }}>
                                    {roadmap.title}
                                </h3>
                                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '40px', lineHeight: '1.5' }}>
                                    {roadmap.description}
                                </p>

                                {/* Visibility Toggle */}
                                <div
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', width: 'fit-content' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        import('../api/roadmapService').then(({ toggleRoadmapVisibility }) => {
                                            toggleRoadmapVisibility(roadmap._id).then(updated => {
                                                setRoadmaps(roadmaps.map(rm => rm._id === roadmap._id ? { ...rm, isPublic: updated.isPublic } : rm));
                                            });
                                        });
                                    }}
                                >
                                    <div style={{ 
                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        padding: '0.35rem 0.6rem', borderRadius: '6px',
                                        background: roadmap.isPublic ? 'rgba(16, 185, 129, 0.1)' : 'rgba(161, 161, 170, 0.1)',
                                        border: `1px solid ${roadmap.isPublic ? 'rgba(16, 185, 129, 0.2)' : 'rgba(161, 161, 170, 0.2)'}`,
                                        transition: 'all 0.3s'
                                    }}>
                                        <span style={{ color: roadmap.isPublic ? '#10b981' : '#a1a1aa' }}>
                                            {roadmap.isPublic ? <GlobeIcon /> : <LockIcon />}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: roadmap.isPublic ? '#10b981' : '#a1a1aa', fontWeight: '500' }}>
                                            {roadmap.isPublic ? 'Publique' : 'Privée'}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar Mini */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        <span>Progression</span>
                                        <span style={{ color: '#e4e4e7' }}>{roadmap.progress?.percentage || 0}%</span>
                                    </div>
                                    <div style={{ height: '4px', backgroundColor: '#27272a', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', backgroundColor: '#3b82f6', width: `${roadmap.progress?.percentage || 0}%`, transition: 'width 0.4s ease', borderRadius: '2px' }}></div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.5rem' }}>
                                        {roadmap.progress?.completedNodes || 0} / {roadmap.progress?.totalNodes || 0} étapes
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Generation Modal (Glassmorphism) */}
            {showGenerateModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(9, 9, 11, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', padding: '2.5rem', borderRadius: '16px', width: '90%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        {isGenerating ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <div style={{ color: '#c084fc', marginBottom: '1.5rem', animation: 'pulse 1.5s ease-in-out infinite' }}>
                                    <SparklesIcon />
                                    <div style={{ marginTop: '1rem', width: '200px', height: '4px', background: '#27272a', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ width: '40%', height: '100%', background: '#c084fc', animation: 'spin 1.5s linear infinite', transformOrigin: 'left' }} />
                                    </div>
                                </div>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#f4f4f5', fontWeight: '600' }}>Génération en cours...</h3>
                                <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.95rem' }}>Analyse de vos objectifs par l'IA.</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', padding: '0.5rem', borderRadius: '8px' }}>
                                        <SparklesIcon />
                                    </div>
                                    <h3 style={{ margin: 0, color: '#f4f4f5', fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em' }}>
                                        IA Roadmap
                                    </h3>
                                </div>
                                <p style={{ color: '#a1a1aa', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
                                    Décrivez votre objectif d'apprentissage et Gemini créera un parcours structuré pour vous.
                                </p>

                                {generationError && (
                                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
                                        <p style={{ color: '#ef4444', margin: 0, fontSize: '0.85rem' }}>Erreur: {generationError}</p>
                                    </div>
                                )}

                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                        <TargetIcon />
                                        <label style={{ fontSize: '0.85rem', fontWeight: '500', color: '#e4e4e7' }}>Objectif</label>
                                    </div>
                                    <input
                                        type="text"
                                        value={goal}
                                        onChange={(e) => setGoal(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && goal.trim() && handleGenerateMap()}
                                        placeholder="ex: Devenir expert en React"
                                        style={{ 
                                            width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', 
                                            border: '1px solid #3f3f46', background: '#09090b', color: '#f4f4f5',
                                            fontSize: '0.95rem', boxSizing: 'border-box',
                                            transition: 'border-color 0.2s', outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                                        onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                    <button
                                        onClick={() => { setShowGenerateModal(false); setGenerationError(null); }}
                                        style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid #3f3f46', borderRadius: '8px', cursor: 'pointer', color: '#a1a1aa', fontWeight: '500', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#f4f4f5'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleGenerateMap}
                                        disabled={!goal.trim()}
                                        style={{ 
                                            padding: '0.6rem 1.2rem', background: '#9333ea', color: 'white', 
                                            border: 'none', borderRadius: '8px', cursor: goal.trim() ? 'pointer' : 'not-allowed', 
                                            fontWeight: '500', opacity: goal.trim() ? 1 : 0.5, transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => { if(goal.trim()) e.currentTarget.style.background = '#a855f7'; }}
                                        onMouseLeave={(e) => { if(goal.trim()) e.currentTarget.style.background = '#9333ea'; }}
                                    >
                                        Générer
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {roadmapToDelete && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(9, 9, 11, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#ef4444' }}>
                            <TrashIcon />
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '600' }}>Supprimer la Roadmap</h3>
                        </div>
                        <p style={{ color: '#a1a1aa', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
                            Êtes-vous sûr de vouloir supprimer définitivement cette roadmap ? Cette action est irréversible.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button
                                onClick={() => setRoadmapToDelete(null)}
                                style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #3f3f46', borderRadius: '6px', cursor: 'pointer', color: '#a1a1aa', fontWeight: '500' }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoadmapsPage;
