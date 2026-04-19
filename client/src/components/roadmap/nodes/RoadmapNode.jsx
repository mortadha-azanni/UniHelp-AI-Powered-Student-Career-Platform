import { Handle, Position } from 'reactflow';
import './RoadmapNode.css';

/**
 * RoadmapNode — unified node for every entry in roadmap.nodes[].
 *
 * Accepted data fields (from backend format):
 *   data.title          {string}   – node title
 *   data.description    {string}   – description
 *   data.status         {string}   – 'done' | 'in_progress' | 'pending'
 *   data.order          {number}   – logical order in the roadmap
 *   data.tools          {Array}    – [{ name, type }]
 *   data.resources      {Array}    – [{ type, title, url }]
 *   data.prerequisites  {Array}    – [string] node ids
 */

// Normalise legacy status values too
const normaliseStatus = (s) => {
    if (s === 'completed' || s === 'done') return 'done';
    if (s === 'in-progress' || s === 'in_progress') return 'in_progress';
    return 'pending';
};

const RoadmapNode = ({ data, selected }) => {
    const statusKey = normaliseStatus(data.status);
    const tools = (data.tools || []).slice(0, 3);
    const resourcesCount = (data.resources || []).length;

    return (
        <div className={`rm-node${selected ? ' rm-node--selected' : ''}`}>
            <Handle type="target" position={Position.Top} />

            {/* Coloured top status bar */}
            <div className={`rm-node__status-bar rm-node__status-bar--${statusKey}`} />

            <div className="rm-node__body">
                {/* Title + order badge */}
                <div className="rm-node__header">
                    <div className="rm-node__title">{data.title || 'Nœud'}</div>
                    {data.order != null && (
                        <div className="rm-node__order-badge">#{data.order}</div>
                    )}
                </div>

                {/* Short description */}
                {data.description && (
                    <div className="rm-node__description">{data.description}</div>
                )}

                {/* Footer: tool chips + status dot */}
                <div className="rm-node__footer">
                    <div className="rm-node__tools">
                        {tools.map((tool, i) => (
                            <span key={i} className="rm-node__tool-chip">{tool.name}</span>
                        ))}
                    </div>
                    <div className="rm-node__meta">
                        {resourcesCount > 0 && (
                            <span className="rm-node__resources-badge">📚 {resourcesCount}</span>
                        )}
                        <div className={`rm-node__status-dot rm-node__status-dot--${statusKey}`} />
                    </div>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

export default RoadmapNode;
