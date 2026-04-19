// ─── ModulePreviewItem ────────────────────────────────────────────────────
const ModulePreviewItem = ({ module, index }) => (
    <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.9rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', transition: 'border-color 0.2s' }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
    >
        <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8', fontSize: '0.68rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {index + 1}
        </span>
        <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {module.title}
        </span>
        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.1rem 0.4rem', fontWeight: '500' }}>⏱ {module.duration}</span>
            <span style={{ fontSize: '0.65rem', color: '#818cf8', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '6px', padding: '0.1rem 0.4rem', fontWeight: '600' }}>{module.taskCount} tâches</span>
        </div>
    </div>
);

export default ModulePreviewItem;
