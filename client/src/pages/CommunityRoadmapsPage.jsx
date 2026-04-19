import { useState, useEffect } from 'react';
import { getPublicRoadmaps, cloneRoadmap, likeRoadmap } from '../api/roadmapService';

const CommunityRoadmapsPage = () => {
    const [publicRoadmaps, setPublicRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cloningId, setCloningId] = useState(null);

    const fetchPublicRoadmaps = async () => {
        setLoading(true);
        try {
            const data = await getPublicRoadmaps();
            // Guard: ensure we always set an array
            setPublicRoadmaps(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch public roadmaps', error);
            setPublicRoadmaps([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublicRoadmaps();
    }, []);

    const handleClone = async (id) => {
        setCloningId(id);
        try {
            await cloneRoadmap(id);
            alert("Roadmap clonée avec succès ! Retrouvez-la dans 'Mes Roadmaps'.");
        } catch (error) {
            console.error('Failed to clone roadmap', error);
            alert("Erreur lors du clonage de la roadmap.");
        } finally {
            setCloningId(null);
        }
    };

    const handleLike = async (id) => {
        try {
            // likeRoadmap now returns the updated roadmap object
            const updatedRoadmap = await likeRoadmap(id);
            setPublicRoadmaps((prev) =>
                prev.map((rm) =>
                    rm._id === id
                        ? { ...rm, likes: updatedRoadmap?.likes ?? rm.likes }
                        : rm
                )
            );
        } catch (error) {
            console.error('Failed to like roadmap', error);
        }
    };

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h2>Communauté 🌍</h2>
                <p className="subtitle">Découvrez, likez et clonez les roadmaps créées par d'autres utilisateurs.</p>
            </div>

            <div className="content-card" style={{ padding: '2rem' }}>
                {loading ? (
                    <p>Chargement de la communauté...</p>
                ) : publicRoadmaps.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏜️</div>
                        <h3>Aucune roadmap publique</h3>
                        <p>Soyez le premier à partager votre parcours avec la communauté !</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {publicRoadmaps.map(roadmap => (
                            <div
                                key={roadmap._id}
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    backgroundColor: 'white',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>{roadmap.title}</h3>
                                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: '#f1f5f9', borderRadius: '12px', color: '#475569' }}>
                                        {roadmap.category || 'General'}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
                                    Par <strong>{roadmap.user?.username || 'Anonyme'}</strong> • {roadmap.nodes?.length || 0} étapes
                                </p>

                                <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {roadmap.description || 'Aucune description fournie.'}
                                </p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: 'auto' }}>
                                    <button
                                        onClick={() => handleLike(roadmap._id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.9rem' }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={roadmap.likes?.length > 0 ? '#ef4444' : 'none'} stroke={roadmap.likes?.length > 0 ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                        {roadmap.likes?.length || 0}
                                    </button>

                                    <button
                                        onClick={() => handleClone(roadmap._id)}
                                        disabled={cloningId === roadmap._id}
                                        style={{ padding: '0.4rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                                    >
                                        {cloningId === roadmap._id ? 'Clonage...' : '✨ Cloner'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityRoadmapsPage;
