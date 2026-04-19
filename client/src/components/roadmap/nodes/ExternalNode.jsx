import { Handle, Position } from 'reactflow';

/**
 * ExternalNode – Leaf / subtopic / resource node.
 *
 * Backend data params:
 *   data.label         {string}   – subtopic title
 *   data.description   {string}   – details / explanation
 *   data.status        {string}   – 'pending' | 'in-progress' | 'completed'
 *   data.xpReward      {number}   – XP value
 *   data.resources     {Array}    – [{ title, url, type }]
 *   data.masteryLevel  {string}   – optional mastery level
 */

const statusStyle = {
    pending: { border: '#cbd5e1', icon: '○', iconColor: '#94a3b8' },
    'in-progress': { border: '#fbbf24', icon: '◑', iconColor: '#f59e0b' },
    completed: { border: '#34d399', icon: '●', iconColor: '#10b981' },
};

const ExternalNode = ({ data, selected }) => {
    const s = statusStyle[data.status] || statusStyle.pending;
    const isCompleted = data.status === 'completed';

    return (
        <div
            style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderLeft: `4px solid ${s.border}`,
                borderRadius: '10px',
                padding: '0.6rem 0.8rem',
                minWidth: '145px',
                maxWidth: '210px',
                boxShadow: selected
                    ? '0 0 0 2px rgba(59,130,246,0.2), 0 6px 16px rgba(0,0,0,0.08)'
                    : '0 2px 8px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: isCompleted ? 0.8 : 1,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                {/* Status icon */}
                <span
                    style={{
                        color: s.iconColor,
                        fontSize: '0.8rem',
                        lineHeight: 1.4,
                        flexShrink: 0,
                        fontWeight: '700',
                    }}
                >
                    {s.icon}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Label */}
                    <div
                        style={{
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: isCompleted ? '#94a3b8' : '#1e293b',
                            lineHeight: 1.35,
                            textDecoration: isCompleted ? 'line-through' : 'none',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {data.label || 'Subtopic'}
                    </div>

                    {/* Description */}
                    {data.description && (
                        <div
                            style={{
                                fontSize: '0.65rem',
                                color: '#94a3b8',
                                lineHeight: 1.4,
                                marginTop: '0.2rem',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                            }}
                        >
                            {data.description}
                        </div>
                    )}

                    {/* Badges */}
                    {(data.resources?.length > 0 || data.xpReward > 0) && (
                        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                            {data.resources?.length > 0 && (
                                <span
                                    style={{
                                        fontSize: '0.58rem',
                                        padding: '0.1rem 0.35rem',
                                        borderRadius: '8px',
                                        backgroundColor: '#f1f5f9',
                                        color: '#64748b',
                                    }}
                                >
                                    📚 {data.resources.length}
                                </span>
                            )}
                            {data.xpReward > 0 && (
                                <span
                                    style={{
                                        fontSize: '0.58rem',
                                        padding: '0.1rem 0.35rem',
                                        borderRadius: '8px',
                                        backgroundColor: '#fef9c3',
                                        color: '#854d0e',
                                        fontWeight: '600',
                                    }}
                                >
                                    ⚡ {data.xpReward}xp
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Handle
                type="target"
                position={Position.Left}
                style={{
                    background: s.border,
                    border: '2px solid white',
                    width: '9px',
                    height: '9px',
                    left: '-5px',
                }}
            />
            <Handle
                type="source"
                position={Position.Right}
                style={{
                    background: '#94a3b8',
                    border: '2px solid white',
                    width: '9px',
                    height: '9px',
                    right: '-5px',
                }}
            />
        </div>
    );
};

export default ExternalNode;
