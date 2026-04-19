import { Handle, Position } from 'reactflow';

/**
 * CentralNode – Main topic / category node.
 *
 * Backend data params:
 *   data.label         {string}   – topic title
 *   data.description   {string}   – short description (from AI or manual)
 *   data.status        {string}   – 'pending' | 'in-progress' | 'completed'
 *   data.masteryLevel  {string}   – e.g. 'Débutant' | 'Intermédiaire' | 'Avancé'
 *   data.xpReward      {number}   – XP value
 *   data.resources     {Array}    – [{ title, url, type }]
 */

const statusConfig = {
    pending: { dot: '#94a3b8', ring: '#e2e8f0' },
    'in-progress': { dot: '#f59e0b', ring: '#fde68a' },
    completed: { dot: '#10b981', ring: '#6ee7b7' },
};

const masteryColors = {
    'Débutant total': { bg: '#dbeafe', color: '#1d4ed8' },
    Débutant: { bg: '#dbeafe', color: '#1d4ed8' },
    'Connaissances de base': { bg: '#dcfce7', color: '#166534' },
    Intermédiaire: { bg: '#fef3c7', color: '#92400e' },
    Avancé: { bg: '#fce7f3', color: '#9d174d' },
};

const CentralNode = ({ data, selected }) => {
    const status = statusConfig[data.status] || statusConfig.pending;
    const mastery = data.masteryLevel
        ? masteryColors[data.masteryLevel] || { bg: '#e0e7ff', color: '#4338ca' }
        : null;

    return (
        <div
            style={{
                background: 'white',
                border: `2px solid ${selected ? '#3b82f6' : status.ring}`,
                borderRadius: '14px',
                padding: '0.85rem 1rem',
                minWidth: '170px',
                maxWidth: '230px',
                boxShadow: selected
                    ? '0 0 0 3px rgba(59,130,246,0.15), 0 10px 28px rgba(0,0,0,0.1)'
                    : '0 4px 16px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
            }}
        >
            {/* Status indicator dot */}
            <div
                style={{
                    position: 'absolute',
                    top: '0.65rem',
                    right: '0.65rem',
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    backgroundColor: status.dot,
                    boxShadow: `0 0 0 2px white, 0 0 0 3px ${status.dot}44`,
                }}
            />

            {/* Label */}
            <div
                style={{
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: '#1e293b',
                    lineHeight: 1.3,
                    paddingRight: '1.2rem',
                    marginBottom: data.description ? '0.4rem' : '0.6rem',
                }}
            >
                {data.label || 'Topic'}
            </div>

            {/* Description */}
            {data.description && (
                <div
                    style={{
                        fontSize: '0.72rem',
                        color: '#64748b',
                        lineHeight: 1.4,
                        marginBottom: '0.6rem',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                {mastery && (
                    <span
                        style={{
                            fontSize: '0.6rem',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '20px',
                            backgroundColor: mastery.bg,
                            color: mastery.color,
                            fontWeight: '700',
                        }}
                    >
                        {data.masteryLevel}
                    </span>
                )}
                {data.resources?.length > 0 && (
                    <span
                        style={{
                            fontSize: '0.6rem',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '20px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                        }}
                    >
                        📚 {data.resources.length}
                    </span>
                )}
                {data.xpReward > 0 && (
                    <span
                        style={{
                            fontSize: '0.6rem',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '20px',
                            backgroundColor: '#fef9c3',
                            color: '#854d0e',
                            fontWeight: '600',
                        }}
                    >
                        ⚡ {data.xpReward}xp
                    </span>
                )}
            </div>

            <Handle
                type="target"
                position={Position.Top}
                style={{ background: '#3b82f6', border: '2px solid white', width: '10px', height: '10px' }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                style={{ background: '#3b82f6', border: '2px solid white', width: '10px', height: '10px' }}
            />
        </div>
    );
};

export default CentralNode;
