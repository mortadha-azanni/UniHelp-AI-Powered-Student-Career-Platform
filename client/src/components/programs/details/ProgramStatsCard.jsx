// ─── ProgramStatsCard ─────────────────────────────────────────────────────
const CircularProgress = ({ pct, size = 140, stroke = 10 }) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;
    const ringColor = pct === 100 ? '#10b981' : pct > 0 ? '#6366f1' : 'rgba(255,255,255,0.1)';
    const textColor = pct === 100 ? '#34d399' : pct > 0 ? '#818cf8' : 'var(--text-tertiary)';
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={ringColor} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s' }} />
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill={textColor} fontSize="22" fontWeight="800" fontFamily="Inter,sans-serif">{pct}%</text>
            <text x="50%" y="50%" dy="20" dominantBaseline="middle" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="Inter,sans-serif" fontWeight="600">COMPLÉTÉ</text>
        </svg>
    );
};

const StatRow = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '1rem' }}>{icon}</span>{label}
        </span>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{value}</span>
    </div>
);

const STATUS_STYLE = {
    'En cours': { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
    'Terminé': { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
    'Brouillon': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
};

const ProgramStatsCard = ({ program }) => {
    const totalModules = program.modules.length;
    const completedModules = program.modules.filter((m) => m.progress === 100).length;
    const totalTasks = program.modules.reduce((acc, m) => acc + m.tasks.length, 0);
    const doneTasks = program.modules.reduce((acc, m) => acc + m.tasks.filter((t) => t.done).length, 0);
    const ss = STATUS_STYLE[program.status] ?? STATUS_STYLE['Brouillon'];
    const formattedDate = new Date(program.lastUpdated).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div style={{ background: 'rgba(25,25,35,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
                <CircularProgress pct={program.progress} />
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <span style={{ background: ss.bg, color: ss.color, borderRadius: '20px', padding: '0.22rem 0.85rem', fontSize: '0.72rem', fontWeight: '700' }}>{program.status}</span>
                </div>
            </div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <div>
                <StatRow icon="📅" label="Durée" value={program.duration} />
                <StatRow icon="📦" label="Modules" value={`${completedModules} / ${totalModules}`} />
                <StatRow icon="✅" label="Tâches" value={`${doneTasks} / ${totalTasks}`} />
                <StatRow icon="🗓" label="Mis à jour" value={formattedDate} />
            </div>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    <span>Progression globale</span>
                    <span style={{ fontWeight: '700', color: '#818cf8' }}>{program.progress}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${program.progress}%`, background: program.progress === 100 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                </div>
            </div>
        </div>
    );
};

export default ProgramStatsCard;
