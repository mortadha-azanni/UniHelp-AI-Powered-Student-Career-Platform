// ─── ProgramsHeader ────────────────────────────────────────────────────────
import { useState } from 'react';

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const ProgramsHeader = ({ onNewProgram }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, marginBottom: '1.75rem' }}>
            <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: '0 0 0.3rem', lineHeight: 1.2 }}>
                    Programmes d'Apprentissage
                </h1>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Apprenez avec un tuteur IA — créez un programme depuis vos roadmaps
                </p>
            </div>
            <button
                onClick={onNewProgram}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', boxShadow: hovered ? '0 8px 28px rgba(99,102,241,0.55)' : '0 4px 16px rgba(99,102,241,0.35)', transform: hovered ? 'translateY(-2px)' : 'translateY(0)', transition: 'transform 0.18s ease, box-shadow 0.18s ease', fontFamily: 'inherit', flexShrink: 0 }}
            >
                🗺️ Créer depuis une Roadmap
            </button>
        </div>
    );
};

export default ProgramsHeader;
