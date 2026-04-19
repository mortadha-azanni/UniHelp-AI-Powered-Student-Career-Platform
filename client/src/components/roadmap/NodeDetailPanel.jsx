import './NodeDetailPanel.css';

/**
 * NodeDetailPanel — right sidebar showing full node details.
 *
 * Props:
 *   node           {object|null}  – currently selected ReactFlow node
 *   allNodes       {array}        – all nodes (for prereq title lookup)
 *   onStatusChange {function}     – (nodeId, status) => void
 *   onGenerateAI   {function}     – () => void
 *   isGeneratingAI {boolean}
 *   onClose        {function}     – () => void
 */

const STATUS_OPTIONS = [
    { key: 'pending',     label: '○ À faire'  },
    { key: 'in-progress', label: '◑ En cours' },
    { key: 'completed',   label: '● Terminé'  },
];

function normaliseStatus(s) {
    if (!s) return 'pending';
    if (s === 'done' || s === 'completed') return 'completed';
    if (s === 'in_progress' || s === 'in-progress') return 'in-progress';
    return 'pending';
}

function activeClass(btnKey, currentStatus) {
    if (btnKey !== currentStatus) return '';
    const map = { pending: 'pending', 'in-progress': 'in_progress', completed: 'done' };
    return ` ndp__status-btn--active-${map[btnKey] || 'pending'}`;
}

const NodeDetailPanel = ({ node, allNodes = [], onStatusChange, onGenerateAI, isGeneratingAI, onClose }) => {
    if (!node) {
        return (
            <aside className="ndp">
                <div className="ndp__header">
                    <h3 className="ndp__header-title">Détails</h3>
                </div>
                <div className="ndp__empty">
                    <div className="ndp__empty-icon">🖱️</div>
                    <p className="ndp__empty-text">Cliquez sur un nœud pour voir ses détails</p>
                    <p className="ndp__empty-hint">Utilisez le champ en bas pour ajouter un nœud</p>
                </div>
            </aside>
        );
    }

    const d = node.data;
    const isProfile = node.id === '__profile__';
    const currentStatus = normaliseStatus(d.status);

    // Build a lookup map: nodeId → title for prerequisites display
    const nodeMap = Object.fromEntries(
        allNodes.map((n) => [n.id, n.data?.title || n.data?.label || n.id])
    );

    return (
        <aside className="ndp">
            <div className="ndp__header">
                <h3 className="ndp__header-title">
                    {isProfile ? 'Roadmap' : 'Nœud sélectionné'}
                </h3>
            </div>

            <div className="ndp__body">

                {/* ── Title + order badge ── */}
                <div className="ndp__section">
                    <div className="ndp__title-row">
                        <div className="ndp__title">
                            {d.title || d.label || d.roadmapTitle || 'Sans titre'}
                        </div>
                        {!isProfile && d.order != null && (
                            <div className="ndp__order-chip">#{d.order}</div>
                        )}
                    </div>
                </div>

                {/* ── Description ── */}
                {d.description && (
                    <div className="ndp__section">
                        <div className="ndp__section-label">Description</div>
                        <p className="ndp__description">{d.description}</p>
                    </div>
                )}

                {/* ── Status buttons (content nodes only) ── */}
                {!isProfile && (
                    <div className="ndp__section">
                        <div className="ndp__section-label">Statut</div>
                        <div className="ndp__status-row">
                            {STATUS_OPTIONS.map(({ key, label }) => (
                                <button
                                    key={key}
                                    className={`ndp__status-btn${activeClass(key, currentStatus)}`}
                                    onClick={() => onStatusChange(node.id, key)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Progress (profile node only) ── */}
                {isProfile && d.progress != null && (
                    <div className="ndp__section">
                        <div className="ndp__section-label">Progression</div>
                        <p className="ndp__description">{d.progress}% complété</p>
                    </div>
                )}

                <div className="ndp__divider" />

                {/* ── Tools & technologies ── */}
                {!isProfile && d.tools?.length > 0 && (
                    <div className="ndp__section">
                        <div className="ndp__section-label">
                            Outils &amp; Technologies ({d.tools.length})
                        </div>
                        <div className="ndp__tools-grid">
                            {d.tools.map((tool, i) => (
                                <div key={i} className="ndp__tool-chip">
                                    {tool.name}
                                    {tool.type && (
                                        <span className="ndp__tool-type">{tool.type}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Resources ── */}
                {d.resources?.length > 0 && (
                    <div className="ndp__section">
                        <div className="ndp__section-label">
                            Ressources ({d.resources.length})
                        </div>
                        <div className="ndp__resources-list">
                            {d.resources.map((res, i) => (
                                <a
                                    key={i}
                                    href={res.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ndp__resource-card"
                                >
                                    <div className="ndp__resource-title">{res.title}</div>
                                    <div className="ndp__resource-meta">
                                        {res.type && (
                                            <span className="ndp__resource-type">{res.type}</span>
                                        )}
                                        <span className="ndp__resource-url">{res.url}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Prerequisites ── */}
                {!isProfile && d.prerequisites?.length > 0 && (
                    <div className="ndp__section">
                        <div className="ndp__section-label">Prérequis</div>
                        <div className="ndp__prereqs">
                            {d.prerequisites.map((pid) => (
                                <div key={pid} className="ndp__prereq-chip">
                                    {nodeMap[pid] || pid}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── AI generate (content nodes only) ── */}
                {!isProfile && (
                    <div className="ndp__section">
                        <button
                            className={`ndp__ai-btn${isGeneratingAI ? ' ndp__ai-btn--loading' : ''}`}
                            onClick={onGenerateAI}
                            disabled={isGeneratingAI}
                        >
                            {isGeneratingAI ? '⏳ Génération IA...' : '✨ Générer avec IA'}
                        </button>
                    </div>
                )}

            </div>
        </aside>
    );
};

export default NodeDetailPanel;
