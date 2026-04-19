import { getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';

const ARROW_ID_PREFIX = 'roadmap-arrow';

export default function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
    animated,
}) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const markerId = `${ARROW_ID_PREFIX}-${id}`;
    const isAnimated = animated !== false; // default to animated

    // Color based on data type
    const strokeColor = data?.color || '#6366f1';
    const strokeWidth = 2.5;

    return (
        <>
            {/* Define the arrowhead marker inline in SVG defs */}
            <defs>
                <marker
                    id={markerId}
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerUnits="strokeWidth"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
                </marker>
                <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                </linearGradient>
            </defs>

            {/* Glow / shadow layer */}
            <path
                d={edgePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth + 4}
                strokeOpacity={0.12}
                strokeLinecap="round"
            />

            {/* Main edge path */}
            <BaseEdge
                path={edgePath}
                markerEnd={`url(#${markerId})`}
                style={{
                    ...style,
                    stroke: `url(#grad-${id})`,
                    strokeWidth,
                    strokeLinecap: 'round',
                    filter: 'drop-shadow(0px 1px 4px rgba(99, 102, 241, 0.35))',
                    strokeDasharray: isAnimated ? '8 4' : 'none',
                    animation: isAnimated ? 'roadmap-dash 1.5s linear infinite' : 'none',
                }}
            />

            <style>{`
                @keyframes roadmap-dash {
                    to { stroke-dashoffset: -36; }
                }
            `}</style>
        </>
    );
}
