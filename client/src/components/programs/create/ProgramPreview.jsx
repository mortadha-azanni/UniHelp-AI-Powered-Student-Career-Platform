// ─── ProgramPreview ───────────────────────────────────────────────────────
import ModulePreviewItem from './ModulePreviewItem';

const LEVEL_COLOR = { Débutant: '#34d399', Intermédiaire: '#818cf8', Avancé: '#f472b6' };
const CATEGORY_COLOR = { Frontend: '#818cf8', Backend: '#34d399', 'Full Stack': '#60a5fa', DevOps: '#fb923c', 'Data Science': '#f472b6', Mobile: '#a78bfa' };

const TypingDots = () => (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '8px' }}>
        {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(99,102,241,0.6)', display: 'inline-block', animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite` }} />
        ))}
        <style>{`@keyframes bounce{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(-5px);opacity:1}}`}</style>
    </div>
);

const MiniRing = ({ pct }) => {
    const r = 20, stroke = 4, circ = 2 * Math.PI * r, offset = circ - (pct / 100) * circ;
    return (
        <svg width="52" height="52" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
            <circle cx="26" cy="26" r={r} fill="none" stroke="#6366f1" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 26 26)" />
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="700" fontFamily="Inter,sans-serif">{pct}%</text>
        </svg>
    );
};

const ProgramPreview = ({ draft }) => {
    const catColor = CATEGORY_COLOR[draft.category] ?? '#818cf8';
    const lvlColor = LEVEL_COLOR[draft.level] ?? '#818cf8';
    const completedTasks = draft.modules.reduce((acc, m) => acc + m.taskCount, 0);
    const ringPct = Math.round((draft.modules.filter(m => m.taskCount > 0).length / Math.max(draft.modules.length, 1)) * 100);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.8)' }} />
                <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aperçu en direct</h3>
            </div>

            <div style={{ flex: 1, background: 'rgba(20,20,32,0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 0 40px rgba(99,102,241,0.08)', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <MiniRing pct={ringPct} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.05rem', fontWeight: '800', color: '#fff', lineHeight: 1.25 }}>
                            {draft.title || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Titre du programme…</span>}
                        </h2>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ background: `${catColor}1a`, color: catColor, border: `1px solid ${catColor}35`, borderRadius: '20px', padding: '0.15rem 0.6rem', fontSize: '0.68rem', fontWeight: '700' }}>{draft.category}</span>
                            <span style={{ background: `${lvlColor}1a`, color: lvlColor, border: `1px solid ${lvlColor}35`, borderRadius: '20px', padding: '0.15rem 0.6rem', fontSize: '0.68rem', fontWeight: '700' }}>{draft.level}</span>
                        </div>
                    </div>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                <p style={{ margin: 0, fontSize: '0.82rem', color: draft.description ? 'var(--text-secondary)' : 'var(--text-tertiary)', lineHeight: 1.6, fontStyle: draft.description ? 'normal' : 'italic' }}>
                    {draft.description || 'La description apparaîtra ici…'}
                </p>

                {/* Meta row */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                    {[{ icon: '⏱', label: 'Durée', value: draft.duration }, { icon: '📦', label: 'Modules', value: String(draft.modules.length) }, { icon: '✅', label: 'Tâches', value: String(completedTasks) }].map(({ icon, label, value }) => (
                        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', flex: 1 }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{icon} {label}</span>
                            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>{value}</span>
                        </div>
                    ))}
                </div>

                {/* Modules list */}
                {draft.modules.length > 0 && (
                    <div>
                        <p style={{ margin: '0 0 0.6rem', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Modules</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {draft.modules.map((mod, i) => <ModulePreviewItem key={mod.id} module={mod} index={i} />)}
                        </div>
                    </div>
                )}

                {/* Typing hint */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.9rem', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '10px' }}>
                    <TypingDots />
                    <span style={{ fontSize: '0.73rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>L'IA génère votre programme…</span>
                </div>
            </div>
        </div>
    );
};

export default ProgramPreview;
