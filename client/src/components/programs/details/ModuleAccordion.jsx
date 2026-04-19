// ─── ModuleAccordion ──────────────────────────────────────────────────────
import ModuleItem from './ModuleItem';

const ModuleAccordion = ({ modules }) => {
    if (!modules || modules.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', color: 'var(--text-tertiary)', gap: '0.5rem' }}>
                <span style={{ fontSize: '2.5rem' }}>📭</span>
                <p style={{ margin: 0, fontSize: '0.88rem' }}>Aucun module disponible</p>
            </div>
        );
    }
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Modules du programme</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.2rem 0.6rem' }}>
                    {modules.length} module{modules.length > 1 ? 's' : ''}
                </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {modules.map((mod, i) => <ModuleItem key={mod.id} module={mod} index={i} />)}
            </div>
        </div>
    );
};

export default ModuleAccordion;
