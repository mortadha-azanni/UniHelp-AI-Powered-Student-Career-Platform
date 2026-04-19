// ─── NextStepCard ─────────────────────────────────────────────────────────
import { useState } from 'react';

const NextStepCard = ({ program, onContinue }) => {
    const [hovered, setHovered] = useState(false);
    const nextModule = program.modules.find((m) => m.progress < 100);

    if (program.progress === 100) {
        return (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🎉</span>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#34d399' }}>Programme terminé !</p>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Félicitations, vous avez complété tous les modules.</p>
            </div>
        );
    }

    return (
        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prochaine étape</p>
            {nextModule ? (
                <>
                    <div>
                        <p style={{ margin: '0 0 0.25rem', fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>{nextModule.title}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>⏱ {nextModule.duration} · {nextModule.progress}% complété</p>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${nextModule.progress}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: '3px' }} />
                    </div>
                    <button onClick={onContinue} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', padding: '0.6rem 1rem', background: hovered ? 'linear-gradient(135deg,#5254cc,#7c3abf)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: hovered ? '0 6px 20px rgba(99,102,241,0.5)' : '0 4px 14px rgba(99,102,241,0.3)', transform: hovered ? 'translateY(-1px)' : 'translateY(0)', transition: 'all 0.18s ease', width: '100%' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        Continuer la formation
                    </button>
                </>
            ) : (
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Aucune étape disponible.</p>
            )}
        </div>
    );
};

export default NextStepCard;
