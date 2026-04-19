// ─── ModuleItem ───────────────────────────────────────────────────────────
import { useState } from 'react';

const ModuleItem = ({ module, index }) => {
    const [open, setOpen] = useState(false);
    const [hovered, setHovered] = useState(false);
    const doneTasks = module.tasks.filter((t) => t.done).length;
    const totalTasks = module.tasks.length;
    const progressLabel = module.progress === 100 ? '✅ Terminé' : module.progress > 0 ? `${module.progress}%` : 'Non commencé';
    const progressLabelColor = module.progress === 100 ? '#34d399' : module.progress > 0 ? '#818cf8' : 'var(--text-tertiary)';
    const barColor = module.progress === 100 ? 'linear-gradient(90deg,#10b981,#34d399)' : module.progress > 0 ? 'linear-gradient(90deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.1)';

    return (
        <div style={{ background: open ? 'rgba(25,25,40,0.9)' : hovered ? 'rgba(30,30,45,0.7)' : 'rgba(25,25,35,0.6)', border: `1px solid ${open ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.2s ease, background 0.2s ease', boxShadow: open ? '0 4px 20px rgba(99,102,241,0.12)' : 'none' }}>
            <button onClick={() => setOpen(v => !v)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: module.progress === 100 ? 'linear-gradient(135deg,#10b981,#34d399)' : 'rgba(99,102,241,0.2)', border: `1px solid ${module.progress === 100 ? '#10b981' : 'rgba(99,102,241,0.4)'}`, color: module.progress === 100 ? '#fff' : '#818cf8', fontSize: '0.72rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {module.progress === 100 ? '✓' : index + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 0.2rem', fontSize: '0.9rem', fontWeight: '700', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{module.title}</p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>⏱ {module.duration} · {doneTasks}/{totalTasks} tâches</p>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: progressLabelColor, whiteSpace: 'nowrap', flexShrink: 0 }}>{progressLabel}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {/* Progress bar */}
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', margin: '0 1.25rem' }}>
                <div style={{ height: '100%', width: `${module.progress}%`, background: barColor, borderRadius: '2px', transition: 'width 0.5s ease' }} />
            </div>

            {/* Task list */}
            {open && (
                <div style={{ padding: '1rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.73rem', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tâches</p>
                    {module.tasks.map((task) => (
                        <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '18px', height: '18px', borderRadius: '5px', border: task.done ? 'none' : '1.5px solid rgba(255,255,255,0.2)', background: task.done ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {task.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                            </div>
                            <span style={{ fontSize: '0.83rem', color: task.done ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.6 : 1 }}>{task.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ModuleItem;
