import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    Panel,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    updateRoadmap,
    generateNodeContent,
    getStudySchedule,
    generateStudySchedule,
    toggleScheduleTask
} from '../../api/roadmapService';
import { createProgramFromRoadmap } from '../../api/programService';
import ScheduleGeneratorModal from './ScheduleGeneratorModal';
import StudyScheduleWidget from './StudyScheduleWidget';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const BackIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const SaveIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const CalendarIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const SparklesIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
const GripIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const FileIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;
const LayersIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polygon points="2 17 12 22 22 17"/><polygon points="2 12 12 17 22 12"/></svg>;
const MaximizeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>;
const MinimizeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>;

// ─── Node / Edge type registries ─────────────────────────────────────────────
const nodeTypes = { customNode: CustomNode };
const edgeTypes = { customEdge: CustomEdge };

const defaultEdgeOptions = {
    type: 'customEdge',
    animated: true,
    style: { strokeWidth: 2.5 },
};

const initialNodes = [{
    id: '1',
    type: 'customNode',
    data: { label: 'Début de l\'apprentissage', description: '', status: 'pending', xpReward: 10 },
    position: { x: 250, y: 50 },
}];

let idCounter = 2;
const newId = () => `node_${idCounter++}`;

// ─── Component ────────────────────────────────────────────────────────────────
const RoadmapBuilder = ({ roadmap, onBack }) => {
    const wrapperRef = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(
        roadmap?.nodes?.length ? roadmap.nodes : initialNodes
    );
    const [edges, setEdges, onEdgesChange] = useEdgesState(
        roadmap?.edges?.length ? roadmap.edges : []
    );
    const [rfInstance, setRfInstance] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isSavingProgram, setIsSavingProgram] = useState(false);
    const [programSaved, setProgramSaved] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);

    // Study Schedule
    const [studySchedule, setStudySchedule] = useState(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isScheduleWidgetOpen, setIsScheduleWidgetOpen] = useState(false);
    const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

    // Toast state
    const [toastMessage, setToastMessage] = useState(null);

    // Fullscreen state
    const [isFullscreen, setIsFullscreen] = useState(false);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // ── Init ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (roadmap?.nodes?.length) {
            const maxId = Math.max(
                ...roadmap.nodes.map(n => parseInt(n.id.replace('node_', '')) || 0),
                idCounter
            );
            idCounter = maxId + 1;
        }
        if (roadmap?._id) loadStudySchedule();
    }, [roadmap]);

    const loadStudySchedule = async () => {
        try {
            const s = await getStudySchedule(roadmap._id);
            if (s) { setStudySchedule(s); setIsScheduleWidgetOpen(true); }
        } catch { /* no schedule yet */ }
    };

    // ── Study Schedule Handlers ───────────────────────────────────────────────
    const handleGenerateSchedule = async (constraints) => {
        setIsGeneratingSchedule(true);
        try {
            const s = await generateStudySchedule(roadmap._id, constraints);
            setStudySchedule(s);
            setIsScheduleModalOpen(false);
            setIsScheduleWidgetOpen(true);
            showToast("Programme généré !");
        } catch (err) {
            console.error(err);
            showToast('Erreur lors de la génération du programme');
        } finally { setIsGeneratingSchedule(false); }
    };

    const handleToggleTask = async (taskId) => {
        try {
            const s = await toggleScheduleTask(roadmap._id, taskId);
            setStudySchedule(s);
        } catch (err) { console.error(err); }
    };

    // ── ReactFlow Handlers ────────────────────────────────────────────────────
    const onConnect = useCallback(
        (params) => setEdges(eds => addEdge({ ...params, ...defaultEdgeOptions }, eds)),
        [setEdges]
    );

    const onDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        const bounds = wrapperRef.current.getBoundingClientRect();
        const type = e.dataTransfer.getData('application/reactflow');
        if (!type || !rfInstance) return;

        const position = rfInstance.project({
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top,
        });
        setNodes(nds => nds.concat({
            id: newId(),
            type: 'customNode',
            position,
            data: { label: 'Nouveau sujet', description: '', status: 'pending', xpReward: 10 },
        }));
    }, [rfInstance, setNodes]);

    const onNodeClick = (_, node) => setSelectedNode(node);

    const updateNodeData = (nodeId, field, value) => {
        setNodes(nds => nds.map(n => {
            if (n.id !== nodeId) return n;
            const updated = { ...n, data: { ...n.data, [field]: value } };
            if (selectedNode?.id === nodeId) setSelectedNode(updated);
            return updated;
        }));
    };

    const handleNodeDelete = () => {
        if (!selectedNode) return;
        setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
        setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
        setSelectedNode(null);
    };

    // ── Save ─────────────────────────────────────────────────────────────────
    const saveRoadmap = async () => {
        if (!roadmap?._id) return;
        setIsSaving(true);
        try {
            await updateRoadmap(roadmap._id, { nodes, edges });
            setSaved(true);
            showToast("Modifications sauvegardées !");
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error(err);
            showToast('Erreur lors de la sauvegarde');
        } finally { setIsSaving(false); }
    };

    // ── Save as Program ──────────────────────────────────────────────────────
    const saveAsProgram = async () => {
        if (!roadmap?._id) return;
        setIsSavingProgram(true);
        try {
            // First save the roadmap
            await updateRoadmap(roadmap._id, { nodes, edges });
            // Then create a program from it
            await createProgramFromRoadmap(roadmap._id);
            setProgramSaved(true);
            showToast("Programme créé !");
            setTimeout(() => setProgramSaved(false), 3000);
        } catch (err) {
            console.error(err);
            showToast("Erreur lors de la création du programme");
        } finally { setIsSavingProgram(false); }
    };

    // ── AI Generate Node Content ──────────────────────────────────────────────
    const handleGenerateAI = async () => {
        if (!roadmap?._id || !selectedNode?.id) return;
        setIsGeneratingAI(true);
        try {
            const updatedNode = await generateNodeContent(roadmap._id, selectedNode.id);
            setNodes(nds => nds.map(n => {
                if (n.id !== selectedNode.id) return n;
                const updated = { ...n, data: updatedNode.data };
                setSelectedNode(updated);
                return updated;
            }));
            showToast("Contenu généré !");
        } catch (err) {
            console.error(err);
            showToast("Erreur lors de la génération IA");
        } finally { setIsGeneratingAI(false); }
    };

    // ── Document Event for Deleting Node & Escape Fullscreen ────────
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode) {
                // Ignore if we are typing inside an input/textarea
                if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
                handleNodeDelete();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [selectedNode, setNodes, setEdges, isFullscreen]);

    // ── Stats ─────────────────────────────────────────────────────────────────
    const totalNodes = nodes.length;
    const completedNodes = nodes.filter(n => n.data?.status === 'completed').length;
    const progressPct = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

    const displayNode = selectedNode;

    // ══════════════════════════════════════════════════════════════════════════
    const wrapperStyles = isFullscreen
        ? { position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', background: '#09090b', fontFamily: "'Inter', sans-serif" }
        : { display: 'flex', height: '100%', flexDirection: 'column', background: '#09090b', fontFamily: "'Inter', sans-serif", flex: 1, minHeight: 0 };

    return (
        <div style={wrapperStyles}>
            
            {/* Scoped CSS for ReactFlow Overrides */}
            <style>{`
                .react-flow__controls button { background: #18181b !important; border-color: #27272a !important; color: #a1a1aa !important; }
                .react-flow__controls button:hover { background: #27272a !important; color: #f4f4f5 !important; }
                .react-flow__minimap { background: #09090b !important; border: 1px solid #27272a !important; border-radius: 8px !important; }
            `}</style>

            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.875rem 1.5rem',
                background: '#09090b',
                borderBottom: '1px solid #27272a',
                gap: '1rem',
                position: 'relative',
                zIndex: 40,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
                    <button
                        onClick={onBack}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 0.75rem', border: '1px solid #27272a',
                            borderRadius: '8px', background: 'transparent',
                            color: '#a1a1aa', cursor: 'pointer', fontSize: '0.875rem',
                            transition: 'all 0.2s', fontWeight: '500',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#f4f4f5'; e.currentTarget.style.background = '#18181b'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'transparent'; }}
                    >
                        <BackIcon /> Retour
                    </button>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '600', color: '#f4f4f5', letterSpacing: '-0.01em' }}>
                                {roadmap?.title || 'Nouvelle Roadmap'}
                            </h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#71717a' }}>
                                {totalNodes} nœuds · {edges.length} connexions
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '80px', height: '4px', background: '#27272a', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progressPct}%`, height: '100%', background: '#3b82f6', transition: 'width 0.5s ease' }} />
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '600' }}>{progressPct}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {studySchedule ? (
                        <button
                            onClick={() => setIsScheduleWidgetOpen(!isScheduleWidgetOpen)}
                            style={{
                                padding: '0.5rem 1rem', border: '1px solid #3b82f6',
                                borderRadius: '8px', background: isScheduleWidgetOpen ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500',
                                display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s',
                            }}
                        >
                            <CalendarIcon /> Programme
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsScheduleModalOpen(true)}
                            style={{
                                padding: '0.5rem 1rem', border: '1px solid rgba(168, 85, 247, 0.3)',
                                borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)',
                                color: '#c084fc', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                            title="Créer un programme d'étude quotidien pour cette Roadmap"
                        >
                            <SparklesIcon /> Générer Planning
                        </button>
                    )}

                    <button
                        onClick={saveAsProgram}
                        disabled={isSavingProgram}
                        style={{
                            padding: '0.5rem 1.25rem',
                            background: programSaved ? '#10b981' : '#f59e0b',
                            color: 'white', border: 'none', borderRadius: '8px',
                            cursor: isSavingProgram ? 'not-allowed' : 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            fontSize: '0.85rem', transition: 'all 0.25s', opacity: isSavingProgram ? 0.7 : 1,
                        }}
                    >
                        {isSavingProgram ? 'Création...' : programSaved ? <><CheckIcon /> Créé</> : '📚 Sauv. en Programme'}
                    </button>

                    <button
                        onClick={saveRoadmap}
                        disabled={isSaving}
                        style={{
                            padding: '0.5rem 1.25rem',
                            background: saved ? '#10b981' : '#3b82f6',
                            color: 'white', border: 'none', borderRadius: '8px',
                            cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            fontSize: '0.85rem', transition: 'all 0.25s', opacity: isSaving ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => { if(!isSaving) e.currentTarget.style.filter = 'brightness(1.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                    >
                        {isSaving ? 'Sauvegarde...' : saved ? <><CheckIcon /> Succès</> : <><SaveIcon /> Sauver</>}
                    </button>

                    <div style={{ width: '1px', height: '24px', background: '#27272a', margin: '0 0.25rem' }} />

                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        style={{
                            padding: '0.45rem', border: '1px solid #27272a',
                            borderRadius: '8px', background: 'transparent',
                            color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#f4f4f5'; e.currentTarget.style.background = '#18181b'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'transparent'; }}
                        title={isFullscreen ? "Quitter le plein écran (Esc)" : "Plein écran"}
                    >
                        {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
                    </button>
                </div>
            </div>

            {/* ── MAIN LAYOUT ────────────────────────────────────────────── */}
            <div style={{ flex: 1, position: 'relative' }}>
                
                {/* ── FLOATING LEFT SIDEBAR ─────────────────────────────────── */}
                <aside style={{
                    position: 'absolute', top: '1.5rem', left: '1.5rem', width: '220px',
                    background: 'rgba(24, 24, 27, 0.75)', backdropFilter: 'blur(16px)',
                    border: '1px solid #27272a', borderRadius: '12px',
                    padding: '1.25rem 1rem', zIndex: 10,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        Palette Outils
                    </div>

                    {[
                        { label: 'Sujet standard', color: '#3b82f6' },
                        { label: 'Objectif clé', color: '#a855f7' },
                        { label: 'Projet pratique', color: '#10b981' },
                    ].map(({ label, color }) => (
                        <div
                            key={label}
                            onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'customNode')}
                            draggable
                            style={{
                                border: '1px solid #27272a', borderRadius: '8px', padding: '0.65rem 0.75rem',
                                background: 'rgba(255, 255, 255, 0.02)', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                cursor: 'grab', fontSize: '0.85rem', fontWeight: '500', color: '#e4e4e7', 
                                transition: 'all 0.2s ease', userSelect: 'none',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = color; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; e.currentTarget.style.borderColor = '#27272a'; }}
                        >
                            <GripIcon /> {label}
                        </div>
                    ))}
                    
                    <div style={{ fontSize: '0.75rem', color: '#71717a', lineHeight: '1.5', marginTop: '1rem', borderTop: '1px solid #27272a', paddingTop: '1rem' }}>
                        Glissez les nœuds vers le canvas, ou tirez une connexion. Appuyez sur <kbd style={{ background: '#27272a', borderRadius: '4px', padding: '2px 6px', color: '#e4e4e7', fontFamily: 'monospace' }}>Suppr</kbd> pour retirer.
                    </div>
                </aside>

                {/* ── THE CANVAS ────────────────────────────────────────────── */}
                <div style={{ width: '100%', height: '100%', background: '#09090b' }} ref={wrapperRef}>
                    <ReactFlowProvider>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges.map(e => ({ ...e, type: 'customEdge', animated: true }))}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            defaultEdgeOptions={defaultEdgeOptions}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onInit={setRfInstance}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            onNodeClick={onNodeClick}
                            onPaneClick={() => setSelectedNode(null)}
                            fitView
                            fitViewOptions={{ padding: 0.3 }}
                        >
                            <Controls position="bottom-left" style={{ margin: '0 0 1.5rem 1.5rem' }} />
                            <MiniMap
                                position="bottom-right"
                                style={{ margin: '0 1.5rem 1.5rem 0' }}
                                nodeColor={(n) => {
                                    if (n.data?.status === 'completed') return '#10b981';
                                    if (n.data?.status === 'in-progress') return '#3b82f6';
                                    return '#27272a';
                                }}
                            />
                            <Background color="#27272a" gap={24} variant="dots" />
                        </ReactFlow>
                    </ReactFlowProvider>
                </div>

                {/* ── FLOATING RIGHT PROPERTIES PANEL ───────────────────────────── */}
                <div style={{
                    position: 'absolute', top: '1.5rem', right: '1.5rem', 
                    width: '320px', maxHeight: 'calc(100% - 3rem)',
                    background: 'rgba(24, 24, 27, 0.75)', backdropFilter: 'blur(16px)',
                    border: '1px solid #27272a', borderRadius: '12px',
                    padding: '0', zIndex: 10,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    display: 'flex', flexDirection: 'column',
                    transform: displayNode ? 'translateX(0)' : 'translateX(120%)',
                    opacity: displayNode ? 1 : 0,
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    overflow: 'hidden'
                }}>
                    {displayNode && (
                        <div style={{ overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Options du Nœud
                                </div>
                                <button onClick={() => setSelectedNode(null)} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}>✕</button>
                            </div>

                            {/* Status Pills */}
                            <div style={{ display: 'flex', gap: '0.5rem', background: '#09090b', padding: '0.25rem', borderRadius: '8px', border: '1px solid #27272a' }}>
                                {['pending', 'in-progress', 'completed'].map(s => {
                                    const c = { pending: 'À faire', 'in-progress': 'En cours', completed: 'Terminé' }[s];
                                    const bg = { pending: '#3f3f46', 'in-progress': '#3b82f6', completed: '#10b981' }[s];
                                    const isActive = (displayNode.data.status || 'pending') === s;
                                    return (
                                        <button
                                            key={s} onClick={() => updateNodeData(displayNode.id, 'status', s)}
                                            style={{
                                                flex: 1, padding: '0.35rem 0', border: 'none', borderRadius: '6px',
                                                cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500', transition: 'all 0.2s',
                                                background: isActive ? bg : 'transparent',
                                                color: isActive ? 'white' : '#71717a',
                                            }}
                                        >
                                            {c}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Title */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#a1a1aa', marginBottom: '0.4rem' }}>Titre de l'Étape</label>
                                <input
                                    type="text" value={displayNode.data.label} onChange={(e) => updateNodeData(displayNode.id, 'label', e.target.value)}
                                    style={{
                                        width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #3f3f46',
                                        background: '#09090b', color: '#f4f4f5', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                                />
                            </div>

                            {/* Description & AI */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#a1a1aa', marginBottom: '0.4rem' }}>Description détaillée</label>
                                <textarea
                                    value={displayNode.data.description || ''} onChange={(e) => updateNodeData(displayNode.id, 'description', e.target.value)}
                                    rows={4}
                                    style={{
                                        width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #3f3f46',
                                        background: '#09090b', color: '#f4f4f5', fontSize: '0.85rem', resize: 'vertical',
                                        boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: '1.5', outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                                />
                                <button
                                    onClick={handleGenerateAI} disabled={isGeneratingAI}
                                    style={{
                                        marginTop: '0.6rem', width: '100%', padding: '0.65rem', background: 'transparent',
                                        color: '#c084fc', border: '1px dashed #a855f7', borderRadius: '8px', cursor: isGeneratingAI ? 'not-allowed' : 'pointer',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                                        fontWeight: '500', fontSize: '0.85rem', transition: 'all 0.2s', opacity: isGeneratingAI ? 0.7 : 1,
                                    }}
                                    onMouseEnter={(e) => { if(!isGeneratingAI) e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <SparklesIcon /> {isGeneratingAI ? 'Génération en cours...' : 'Générer avec l\'IA'}
                                </button>
                            </div>

                            {/* Resources */}
                            {displayNode.data.resources?.length > 0 && (
                                <div style={{ borderTop: '1px solid #27272a', paddingTop: '1.25rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#e4e4e7', marginBottom: '0.6rem' }}>Ressources</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {displayNode.data.resources.map((res, i) => (
                                            <a key={i} href={res.url} target="_blank" rel="noreferrer"
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                    padding: '0.5rem 0.6rem', borderRadius: '6px', background: '#09090b', border: '1px solid #27272a',
                                                    textDecoration: 'none', transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#18181b'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#09090b'}
                                            >
                                                <div style={{ color: '#a1a1aa' }}><FileIcon /></div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#f4f4f5', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{res.title}</span>
                                                    <span style={{ fontSize: '0.65rem', color: '#71717a', textTransform: 'uppercase' }}>{res.type}</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Optional Placeholder below Right Panel */}
                {!displayNode && (
                     <div style={{ 
                        position: 'absolute', top: '1.5rem', right: '1.5rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'rgba(24, 24, 27, 0.4)', borderRadius: '20px', padding: '0.4rem 0.8rem',
                        border: '1px solid #27272a', color: '#71717a', fontSize: '0.8rem', zIndex: 1
                    }}>
                        <LayersIcon /> Séléctionnez un nœud
                    </div>
                )}
            </div>

            {/* ── TOAST NOTIFICATION ───────────────────────────────────────── */}
            {toastMessage && (
                <div style={{
                    position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
                    background: '#18181b', color: '#f4f4f5', padding: '0.65rem 1.25rem',
                    borderRadius: '8px', border: '1px solid #27272a', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    zIndex: 100, animation: 'fadeIn 0.2s ease-out'
                }}>
                    <CheckIcon /> {toastMessage}
                </div>
            )}

            {/* ── OVERLAYS ────────────────────────────────────────────────── */}
            {isScheduleModalOpen && (
                <ScheduleGeneratorModal
                    onGenerate={handleGenerateSchedule}
                    onClose={() => setIsScheduleModalOpen(false)}
                    isGenerating={isGeneratingSchedule}
                />
            )}
            {isScheduleWidgetOpen && studySchedule && (
                <StudyScheduleWidget
                    schedule={studySchedule}
                    onToggleTask={handleToggleTask}
                    onClose={() => setIsScheduleWidgetOpen(false)}
                />
            )}
        </div>
    );
};

export default RoadmapBuilder;
