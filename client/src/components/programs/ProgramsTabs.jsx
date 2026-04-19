// ─── ProgramsTabs ──────────────────────────────────────────────────────────
const TAB_ICONS = { Tous: '🗂', 'En cours': '▶️', Terminé: '✅', Brouillon: '📝' };

const ProgramsTabs = ({ activeTab, onTabChange, counts = {}, tabs }) => (
    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '0.35rem', width: 'fit-content' }}>
        {tabs.map((tab) => {
            const isActive = tab === activeTab;
            const count = counts[tab];
            return (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: isActive ? '700' : '500', color: isActive ? '#fff' : 'var(--text-secondary)', background: isActive ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent', boxShadow: isActive ? '0 4px 14px rgba(99,102,241,0.4)' : 'none', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}
                    onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; } }}
                    onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}
                >
                    <span style={{ fontSize: '0.95rem' }}>{TAB_ICONS[tab]}</span>
                    {tab}
                    {count !== undefined && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '18px', height: '18px', padding: '0 5px', borderRadius: '9px', fontSize: '0.68rem', fontWeight: '700', background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(99,102,241,0.18)', color: isActive ? '#fff' : '#818cf8' }}>
                            {count}
                        </span>
                    )}
                </button>
            );
        })}
    </div>
);

export default ProgramsTabs;
