import { Handle, Position, useStore } from 'reactflow';
import './ProfileNode.css';

/**
 * ProfileNode – Root header card of the roadmap.
 * Zoom-invariant (counter-scaled) and non-draggable.
 *
 * Data injected by RoadmapBuilder:
 *   data.label            – roadmap goal / title
 *   data.roadmapTitle     – roadmap name
 *   data.userName         – logged-in user's username
 *   data.userInitials     – 1-2 letter initials
 *   data.progress         – 0-100 completion %
 *   data.progressPercentage – alternative field from backend
 *   data.status           – 'not_started' | 'in_progress' | 'completed'
 *   data.xpReward         – (optional) XP value
 */

function resolveStatusKey(s) {
    if (!s) return 'not_started';
    if (s === 'completed' || s === 'done') return 'completed';
    if (s === 'in_progress' || s === 'in-progress' || s === 'in progress') return 'in_progress';
    return 'not_started';
}

function statusLabel(s) {
    if (s === 'completed' || s === 'done') return 'Terminé';
    if (s === 'in_progress' || s === 'in-progress') return 'En cours';
    return 'Début';
}

const CARD_W = 300;
const CARD_H = 172;

const ProfileNode = ({ data, selected }) => {
    const zoom = useStore((s) => s.transform[2]);
    const scale = 1 / Math.max(zoom, 0.05);

    const progress = Math.min(100, Math.max(0, data.progress ?? data.progressPercentage ?? 0));
    const initials = data.userInitials || (data.userName ? data.userName.slice(0, 2).toUpperCase() : 'U');
    const pctLevel = progress >= 80 ? 'high' : progress >= 40 ? 'medium' : 'low';
    const sKey = resolveStatusKey(data.status);

    return (
        <div className="pn-outer" style={{ width: CARD_W, height: CARD_H }}>
            <div
                className={`pn-inner${selected ? ' pn-inner--selected' : ''}`}
                style={{ transform: `scale(${scale})` }}
            >
                {/* Top row */}
                <div className="pn-top-row">
                    <div className="pn-avatar">{initials}</div>
                    <div className="pn-user-info">
                        <div className="pn-user-name">{data.userName || 'Utilisateur'}</div>
                        <div className="pn-roadmap-title">{data.roadmapTitle || 'Ma Roadmap'}</div>
                    </div>
                    <div className={`pn-status-badge pn-status-badge--${sKey}`}>
                        {statusLabel(data.status)}
                    </div>
                </div>

                {/* Goal */}
                <div className="pn-goal">
                    🎯 {data.label || 'Mon objectif principal'}
                </div>

                {/* Progress bar */}
                <div className="pn-progress-section">
                    <div className="pn-progress-header">
                        <span className="pn-progress-label">Progression</span>
                        <span className={`pn-progress-pct pn-progress-pct--${pctLevel}`}>{progress}%</span>
                    </div>
                    <div className="pn-progress-track">
                        <div
                            className={`pn-progress-fill pn-progress-fill--${pctLevel}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {data.xpReward > 0 && <div className="pn-xp">⚡{data.xpReward} XP</div>}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                style={{ bottom: -5, zIndex: 1 }}
            />
        </div>
    );
};

export default ProfileNode;
