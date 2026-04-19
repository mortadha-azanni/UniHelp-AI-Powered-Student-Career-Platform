// ─── ProgramHeader (details) ───────────────────────────────────────────────
import { useState } from 'react';

const CATEGORY_COLORS = { Frontend: '#818cf8', Backend: '#34d399', 'Full Stack': '#60a5fa', DevOps: '#fb923c', 'Data Science': '#f472b6', Mobile: '#a78bfa' };

const ProgramHeader = ({ program, onBack, onEdit, onContinue }) => {
    const [editHovered, setEditHovered] = useState(false);
    const [continueHovered, setContinueHovered] = useState(false);
    const catColor = CATEGORY_COLORS[program.category] ?? '#818cf8';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.75rem', flexShrink: 0 }}>
            {/* Back */}
            <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: '500', fontFamily: 'inherit', padding: 0, width: 'fit-content' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                Retour aux programmes
            </button>

            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                        <h1 style={{ fontSize: '1.65rem', fontWeight: '800', background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0, lineHeight: 1.2 }}>{program.title}</h1>
                        <span style={{ background: `${catColor}1a`, color: catColor, border: `1px solid ${catColor}40`, borderRadius: '20px', padding: '0.2rem 0.75rem', fontSize: '0.72rem', fontWeight: '700' }}>{program.category}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-secondary)' }}>⏱ {program.duration} · Dernière mise à jour {new Date(program.lastUpdated).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
                    <button onClick={onEdit} onMouseEnter={() => setEditHovered(true)} onMouseLeave={() => setEditHovered(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', background: editHovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s ease' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Modifier le programme
                    </button>
                    <button onClick={onContinue} onMouseEnter={() => setContinueHovered(true)} onMouseLeave={() => setContinueHovered(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', background: continueHovered ? 'linear-gradient(135deg,#5254cc,#7c3abf)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: continueHovered ? '0 6px 20px rgba(99,102,241,0.5)' : '0 4px 14px rgba(99,102,241,0.35)', transform: continueHovered ? 'translateY(-1px)' : 'translateY(0)', transition: 'all 0.18s ease' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        Continuer la formation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProgramHeader;
