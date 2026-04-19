// ─── ProgramsPage ─────────────────────────────────────────────────────────
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPrograms, deleteProgram } from '../../api/programService';
import ProgramsHeader from '../../components/programs/ProgramsHeader';
import ProgramsTabs from '../../components/programs/ProgramsTabs';
import ProgramCard from '../../components/programs/ProgramCard';

const TABS = ['Tous', 'En cours', 'Terminé', 'Brouillon'];

const ProgramsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Tous');
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPrograms = async () => {
        setLoading(true);
        try {
            const data = await getPrograms();
            setPrograms(data);
        } catch (error) {
            console.error('Failed to fetch programs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, []);

    const filteredPrograms = useMemo(() => {
        if (activeTab === 'Tous') return programs;
        return programs.filter((p) => p.status === activeTab);
    }, [activeTab, programs]);

    const counts = useMemo(() => {
        const result = { Tous: programs.length };
        ['En cours', 'Terminé', 'Brouillon'].forEach((s) => {
            result[s] = programs.filter((p) => p.status === s).length;
        });
        return result;
    }, [programs]);

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce programme ?')) return;
        try {
            await deleteProgram(id);
            setPrograms(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            console.error('Failed to delete program', err);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <ProgramsHeader onNewProgram={() => navigate("/dashboard/roadmaps")} />

            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                <ProgramsTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} tabs={TABS} />

                <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                    {filteredPrograms.length} programme{filteredPrograms.length !== 1 ? 's' : ''} trouvé{filteredPrograms.length !== 1 ? 's' : ''}
                </p>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: 'var(--text-tertiary)' }}>
                        <div style={{
                            width: '40px', height: '40px',
                            border: '3px solid rgba(99,102,241,0.2)',
                            borderTopColor: '#6366f1',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                            marginBottom: '1rem'
                        }} />
                        <p style={{ margin: 0, fontSize: '0.88rem' }}>Chargement des programmes...</p>
                    </div>
                ) : filteredPrograms.length === 0 ? (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', padding: '4rem', color: 'var(--text-tertiary)',
                        textAlign: 'center', gap: '1rem'
                    }}>
                        <div style={{ fontSize: '3rem', opacity: 0.6 }}>📚</div>
                        <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                            Aucun programme trouvé
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.88rem', maxWidth: '400px', lineHeight: 1.5 }}>
                            Créez d'abord une roadmap, puis cliquez sur "📚 Sauv. en Programme" pour la convertir en programme d'apprentissage interactif.
                        </p>
                        <button
                            onClick={() => navigate("/dashboard/roadmaps")}
                            style={{
                                padding: '0.65rem 1.5rem',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white', border: 'none', borderRadius: '10px',
                                cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem',
                                fontFamily: 'inherit',
                                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                                transition: 'all 0.2s',
                                marginTop: '0.5rem'
                            }}
                        >
                            🗺️ Aller aux Roadmaps
                        </button>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                        gap: '1.25rem',
                        alignContent: 'start',
                        paddingBottom: '2rem',
                    }}>
                        {filteredPrograms.map((program) => (
                            <ProgramCard
                                key={program._id}
                                program={program}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgramsPage;
