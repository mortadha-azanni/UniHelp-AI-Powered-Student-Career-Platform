import { Handle, Position } from 'reactflow';

// ─── SVGs ────────────────────────────────────────────────────────────────────
const LockIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const RocketIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><mpath d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>;
const CheckCircleIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

const CustomNode = ({ data, selected }) => {
    // Styling based on status
    const getStatusStyles = (status) => {
        switch (status) {
            case 'completed':
            case 'done':
                return {
                    topBorder: '#10b981',
                    iconColor: '#10b981',
                    icon: <CheckCircleIcon />,
                    activeBg: 'rgba(16, 185, 129, 0.05)',
                };
            case 'in-progress':
            case 'in_progress':
                return {
                    topBorder: '#3b82f6',
                    iconColor: '#3b82f6',
                    icon: <RocketIcon />,
                    activeBg: 'rgba(59, 130, 246, 0.05)',
                };
            case 'pending':
            default:
                return {
                    topBorder: '#52525b',
                    iconColor: '#71717a',
                    icon: <LockIcon />,
                    activeBg: 'transparent',
                };
        }
    };

    const styles = getStatusStyles(data.status);

    const nodeStyle = {
        padding: '16px',
        borderRadius: '12px',
        background: '#18181b', // Glass dark cards
        color: '#f4f4f5',
        border: `1px solid ${selected ? '#a855f7' : '#27272a'}`,
        borderTop: `3px solid ${styles.topBorder}`, // Critical indicator
        boxShadow: selected
            ? '0 0 0 4px rgba(168, 85, 247, 0.15), 0 10px 25px rgba(0, 0, 0, 0.5)'
            : '0 8px 24px rgba(0, 0, 0, 0.4)',
        width: '260px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: data.status === 'pending' && !selected ? 0.85 : 1,
        fontFamily: "'Inter', sans-serif",
        cursor: 'pointer',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
        position: 'relative',
        overflow: 'hidden'
    };

    return (
        <div style={nodeStyle}>
            {/* Background highlight pattern for active states */}
            {data.status !== 'pending' && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', background: `linear-gradient(to bottom, ${styles.activeBg}, transparent)`, pointerEvents: 'none' }} />
            )}

            <Handle
                type="target"
                position={Position.Top}
                style={{ background: '#3f3f46', width: '10px', height: '10px', border: '2px solid #18181b', borderRadius: '50%' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
                <span style={{ color: styles.iconColor, display: 'flex', alignItems: 'center' }}>
                    {styles.icon}
                </span>
                {data.xpReward && (
                    <span style={{
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        background: '#09090b',
                        color: '#a1a1aa',
                        border: '1px solid #27272a',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        letterSpacing: '0.5px',
                    }}>
                        +{data.xpReward} XP
                    </span>
                )}
            </div>

            <strong style={{ fontSize: '1rem', lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.01em', color: '#f4f4f5', zIndex: 1 }}>
                {data.label}
            </strong>

            {data.description && (
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#a1a1aa', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', zIndex: 1 }}>
                    {data.description}
                </p>
            )}

            {data.tools && data.tools.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px', zIndex: 1 }}>
                    {data.tools.slice(0, 4).map((tool, idx) => (
                        <span key={idx} style={{
                            fontSize: '0.65rem',
                            fontWeight: '500',
                            background: '#27272a',
                            color: '#e4e4e7',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {tool.name}
                        </span>
                    ))}
                    {data.tools.length > 4 && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 'bold', alignSelf: 'center', color: '#71717a' }}>
                            +{data.tools.length - 4}
                        </span>
                    )}
                </div>
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                style={{ background: '#3f3f46', width: '10px', height: '10px', border: '2px solid #18181b', borderRadius: '50%' }}
            />
        </div>
    );
};

export default CustomNode;
