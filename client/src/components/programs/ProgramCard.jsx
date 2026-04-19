// ─── ProgramCard ──────────────────────────────────────────────────────────
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_ICON = { Frontend: '⚛️', Backend: '🟢', 'Full Stack': '🏗️', DevOps: '🐳', 'Data Science': '🐍', Mobile: '📱', General: '📚', 'AI Generated': '✨' };

const STATUS_STYLES = {
    'En cours': { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', dot: '#6366f1' },
    'Terminé': { bg: 'rgba(16,185,129,0.15)', color: '#34d399', dot: '#10b981' },
    'Brouillon': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', dot: '#f59e0b' },
};

const DIFFICULTY_STYLES = {
    Beginner: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', label: 'Débutant' },
    Intermediate: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', label: 'Intermédiaire' },
    Advanced: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', label: 'Avancé' },
};

const StatusBadge = ({ status }) => {
    const s = STATUS_STYLES[status] ?? STATUS_STYLES['Brouillon'];
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: s.bg, color: s.color, borderRadius: '20px', padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: '700' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
            {status}
        </span>
    );
};

const ProgramCard = ({ program, onDelete }) => {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(false);
    const [btnHovered, setBtnHovered] = useState(false);
    const [delBtnHovered, setDelBtnHovered] = useState(false);
    const pct = program.progress ?? 0;
    const icon = CATEGORY_ICON[program.category] ?? '📚';
    const formattedDate = new Date(program.updatedAt || program.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    const totalModules = program.modules?.length || 0;
    const completedModules = program.modules?.filter(m => m.progress === 100).length || 0;
    const diff = DIFFICULTY_STYLES[program.difficulty] || DIFFICULTY_STYLES.Intermediate;

    return (
        <article
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'rgba(25,25,35,0.8)', backdropFilter: 'blur(16px)',
                border: `1px solid ${hovered ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '18px', padding: '1.5rem',
                display: 'flex', flexDirection: 'column', gap: '1rem',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hovered ? '0 12px 40px rgba(99,102,241,0.22), 0 4px 12px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.2)',
                position: 'relative',
            }}
        >
            {/* Delete button */}
            {onDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(program._id); }}
                    onMouseEnter={() => setDelBtnHovered(true)}
                    onMouseLeave={() => setDelBtnHovered(false)}
                    style={{
                        position: 'absolute', top: '0.75rem', right: '0.75rem',
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: delBtnHovered ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#f87171', fontSize: '1rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s', padding: 0, lineHeight: 1,
                    }}
                    title="Supprimer"
                >
                    ×
                </button>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingRight: '1.5rem' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.35))', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                    {icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: '0 0 0.35rem', fontSize: '0.97rem', fontWeight: '700', color: '#fff', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {program.title}
                    </h3>
                    <StatusBadge status={program.status} />
                </div>
            </div>

            {/* Meta tags */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[program.category, `📦 ${totalModules} modules`].map((lbl) => (
                    <span key={lbl} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.18rem 0.6rem', fontSize: '0.73rem', color: 'var(--text-tertiary)', fontWeight: '500' }}>{lbl}</span>
                ))}
                <span style={{ background: diff.bg, border: `1px solid ${diff.color}33`, borderRadius: '8px', padding: '0.18rem 0.6rem', fontSize: '0.73rem', color: diff.color, fontWeight: '600' }}>
                    {diff.label}
                </span>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                <span>✅ {program.completedLessons || 0}/{program.totalLessons || 0} leçons</span>
                <span>📦 {completedModules}/{totalModules} modules</span>
            </div>

            {/* Progress bar */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    <span>Progression</span>
                    <span style={{ fontWeight: '700', color: pct > 0 ? '#818cf8' : 'var(--text-tertiary)' }}>{pct}%</span>
                </div>
                <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', paddingTop: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Mis à jour le {formattedDate}</span>
                <button
                    onClick={() => navigate(`/dashboard/programs/${program._id}`)}
                    onMouseEnter={() => setBtnHovered(true)}
                    onMouseLeave={() => setBtnHovered(false)}
                    style={{ padding: '0.4rem 1rem', background: btnHovered ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: '9px', color: btnHovered ? '#fff' : '#818cf8', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.18s ease', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: btnHovered ? '0 4px 14px rgba(99,102,241,0.4)' : 'none' }}
                >
                    Apprendre →
                </button>
            </div>
        </article>
    );
};

export default ProgramCard;
