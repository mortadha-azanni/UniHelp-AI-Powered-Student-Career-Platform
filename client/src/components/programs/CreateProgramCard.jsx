// ─── CreateProgramCard ────────────────────────────────────────────────────
import { useState } from 'react';

const CreateProgramCard = ({ onClick }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', padding: '2rem 1.5rem', background: hovered ? 'rgba(99,102,241,0.07)' : 'rgba(255,255,255,0.02)', border: `2px dashed ${hovered ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '18px', cursor: 'pointer', transition: 'all 0.22s ease', transform: hovered ? 'translateY(-3px)' : 'translateY(0)', boxShadow: hovered ? '0 8px 28px rgba(99,102,241,0.15)' : 'none', fontFamily: 'inherit', width: '100%', minHeight: '200px' }}
        >
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: hovered ? 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.4))' : 'rgba(255,255,255,0.05)', border: `1px solid ${hovered ? 'rgba(99,102,241,0.45)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.22s ease' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={hovered ? '#818cf8' : 'rgba(255,255,255,0.35)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.22s ease' }}>
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.92rem', fontWeight: '700', color: hovered ? '#c4b5fd' : 'var(--text-secondary)', transition: 'color 0.22s ease' }}>Créer un programme</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Définissez un nouveau parcours d'apprentissage</p>
            </div>
        </button>
    );
};

export default CreateProgramCard;
