// ─── ProgramDetailsPage ───────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProgramById, sendLessonChat, toggleLessonComplete } from '../../api/programService';

// ── Inject animations ────────────────────────────────────────────────────
const cssId = 'program-details-styles';
if (!document.getElementById(cssId)) {
    const s = document.createElement('style');
    s.id = cssId;
    s.innerHTML = `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        .program-module-item:hover { border-color: rgba(99,102,241,0.4) !important; background: rgba(99,102,241,0.06) !important; }
        .program-lesson-item:hover { background: rgba(99,102,241,0.08) !important; }
        .program-send-btn:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-1px); }
        .chat-msg { animation: slideIn 0.3s ease both; }
    `;
    document.head.appendChild(s);
}

// ── Markdown-lite renderer ───────────────────────────────────────────────
const renderMarkdown = (text) => {
    if (!text) return '';
    let html = text
        .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:1rem;overflow-x:auto;margin:0.5rem 0;font-size:0.82rem;line-height:1.5"><code>$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code style="background:rgba(99,102,241,0.15);color:#a5b4fc;padding:1px 5px;border-radius:4px;font-size:0.85em">$1</code>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^### (.+)$/gm, '<h4 style="margin:0.75rem 0 0.25rem;font-size:0.95rem;color:#e2e8f0">$1</h4>')
        .replace(/^## (.+)$/gm, '<h3 style="margin:0.75rem 0 0.25rem;font-size:1rem;color:#f1f5f9">$1</h3>')
        .replace(/^# (.+)$/gm, '<h2 style="margin:0.75rem 0 0.25rem;font-size:1.1rem;color:#f8fafc">$1</h2>')
        .replace(/^- (.+)$/gm, '<div style="display:flex;gap:0.5rem;margin:0.15rem 0"><span style="color:#6366f1">•</span><span>$1</span></div>')
        .replace(/^(\d+)\. (.+)$/gm, '<div style="display:flex;gap:0.5rem;margin:0.15rem 0"><span style="color:#6366f1;font-weight:700;min-width:1.2rem">$1.</span><span>$2</span></div>')
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br/>');
    return html;
};

const ProgramDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeModule, setActiveModule] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    // ── Fetch program ────────────────────────────────────────────────────
    useEffect(() => {
        const fetchProgram = async () => {
            setLoading(true);
            try {
                const data = await getProgramById(id);
                setProgram(data);
                // Auto-select first module and first lesson
                if (data.modules?.length > 0) {
                    setActiveModule(data.modules[0]);
                    if (data.modules[0].lessons?.length > 0) {
                        const firstLesson = data.modules[0].lessons[0];
                        setActiveLesson(firstLesson);
                        setChatMessages(firstLesson.chatHistory || []);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch program', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProgram();
    }, [id]);

    // ── Auto-scroll chat ─────────────────────────────────────────────────
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // ── Select lesson ────────────────────────────────────────────────────
    const selectLesson = useCallback((mod, lesson) => {
        setActiveModule(mod);
        setActiveLesson(lesson);
        setChatMessages(lesson.chatHistory || []);
        setInputValue('');
    }, []);

    // ── Send message ─────────────────────────────────────────────────────
    const handleSend = async () => {
        if (!inputValue.trim() || isSending || !activeLesson || !activeModule) return;

        const userMsg = { role: 'user', content: inputValue.trim() };
        setChatMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsSending(true);

        try {
            const result = await sendLessonChat(
                program._id,
                activeModule.id,
                activeLesson.id,
                userMsg.content
            );
            setChatMessages(result.chatHistory || []);
            // Update local lesson's chatHistory
            setActiveLesson(prev => ({ ...prev, chatHistory: result.chatHistory }));
        } catch (err) {
            console.error('Chat error:', err);
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Erreur de connexion avec le tuteur IA. Veuillez réessayer.'
            }]);
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    };

    // ── Toggle completion ────────────────────────────────────────────────
    const handleToggleComplete = async () => {
        if (isToggling || !activeLesson || !activeModule) return;
        setIsToggling(true);
        try {
            const updated = await toggleLessonComplete(program._id, activeModule.id, activeLesson.id);
            setProgram(updated);
            // Refresh active state
            const mod = updated.modules.find(m => m.id === activeModule.id);
            const lesson = mod?.lessons.find(l => l.id === activeLesson.id);
            if (mod) setActiveModule(mod);
            if (lesson) setActiveLesson(prev => ({ ...prev, completed: lesson.completed }));
        } catch (err) {
            console.error('Toggle error:', err);
        } finally {
            setIsToggling(false);
        }
    };

    // ── Start lesson (first message) ─────────────────────────────────────
    const startLesson = async () => {
        if (isSending) return;
        setIsSending(true);
        setChatMessages([{ role: 'user', content: 'start' }]);
        try {
            const result = await sendLessonChat(
                program._id,
                activeModule.id,
                activeLesson.id,
                'start'
            );
            setChatMessages(result.chatHistory || []);
            setActiveLesson(prev => ({ ...prev, chatHistory: result.chatHistory }));
        } catch (err) {
            console.error('Start lesson error:', err);
            setChatMessages([{
                role: 'assistant',
                content: '❌ Erreur lors du démarrage de la leçon. Veuillez réessayer.'
            }]);
        } finally {
            setIsSending(false);
        }
    };

    // ── Loading state ────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1rem', color: 'var(--text-tertiary)' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p>Chargement du programme...</p>
            </div>
        );
    }

    if (!program) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1rem', color: 'var(--text-tertiary)' }}>
                <span style={{ fontSize: '3rem' }}>🔍</span>
                <p>Programme introuvable</p>
                <button onClick={() => navigate('/dashboard/programs')} style={{ padding: '0.5rem 1.5rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' }}>
                    Retour aux programmes
                </button>
            </div>
        );
    }

    const totalLessons = program.totalLessons || 0;
    const completedLessons = program.completedLessons || 0;
    const progress = program.progress || 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', animation: 'fadeInUp 0.35s ease both', fontFamily: "'Inter', sans-serif" }}>
            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.07)',
                marginBottom: '0', flexShrink: 0, gap: '1rem', flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                    <button
                        onClick={() => navigate('/dashboard/programs')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.82rem', fontFamily: 'inherit', padding: 0 }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                        Retour
                    </button>
                    <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ minWidth: 0 }}>
                        <h1 style={{ fontSize: '1.3rem', fontWeight: '800', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {program.title}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                ✅ {completedLessons}/{totalLessons} leçons
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#6366f1,#8b5cf6)', transition: 'width 0.5s ease' }} />
                                </div>
                                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#818cf8' }}>{progress}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MAIN BODY ────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 0 }}>

                {/* ── LEFT: Module / Lesson sidebar ────────────────────────── */}
                <div style={{
                    width: '280px', flexShrink: 0,
                    borderRight: '1px solid rgba(255,255,255,0.07)',
                    overflowY: 'auto', padding: '1rem',
                    display: 'flex', flexDirection: 'column', gap: '0.75rem'
                }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
                        Modules & Leçons
                    </div>

                    {program.modules.map((mod) => (
                        <div key={mod.id} className="program-module-item" style={{
                            background: 'rgba(25,25,40,0.5)',
                            border: `1px solid ${activeModule?.id === mod.id ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s',
                        }}>
                            <div style={{
                                padding: '0.75rem 0.85rem',
                                borderBottom: '1px solid rgba(255,255,255,0.04)'
                            }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '0.25rem', lineHeight: 1.3 }}>
                                    {mod.title}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ width: `${mod.progress}%`, height: '100%', background: mod.progress === 100 ? '#10b981' : '#6366f1', transition: 'width 0.4s ease' }} />
                                    </div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: '700', color: mod.progress === 100 ? '#34d399' : '#818cf8' }}>{mod.progress}%</span>
                                </div>
                            </div>

                            <div style={{ padding: '0.4rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {mod.lessons.map((lesson) => {
                                    const isActive = activeLesson?.id === lesson.id && activeModule?.id === mod.id;
                                    return (
                                        <button
                                            key={lesson.id}
                                            className="program-lesson-item"
                                            onClick={() => selectLesson(mod, lesson)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                padding: '0.5rem 0.6rem', border: 'none', borderRadius: '8px',
                                                background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                                                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                                                transition: 'all 0.15s', width: '100%',
                                            }}
                                        >
                                            <div style={{
                                                width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                                                border: lesson.completed ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                                                background: lesson.completed ? 'linear-gradient(135deg,#10b981,#34d399)' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {lesson.completed && (
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                )}
                                            </div>
                                            <span style={{
                                                fontSize: '0.78rem',
                                                color: isActive ? '#a5b4fc' : lesson.completed ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                                                fontWeight: isActive ? '700' : '500',
                                                textDecoration: lesson.completed ? 'line-through' : 'none',
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                flex: 1, minWidth: 0,
                                            }}>
                                                {lesson.title}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── RIGHT: Chat area ─────────────────────────────────────── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

                    {activeLesson ? (
                        <>
                            {/* Chat header */}
                            <div style={{
                                padding: '0.85rem 1.25rem',
                                borderBottom: '1px solid rgba(255,255,255,0.07)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                flexShrink: 0, gap: '1rem',
                            }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        💬 {activeLesson.title}
                                    </h2>
                                    {activeLesson.description && (
                                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {activeLesson.description}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={handleToggleComplete}
                                    disabled={isToggling}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '8px',
                                        background: activeLesson.completed
                                            ? 'linear-gradient(135deg,#10b981,#059669)'
                                            : 'rgba(255,255,255,0.06)',
                                        color: activeLesson.completed ? 'white' : 'var(--text-secondary)',
                                        fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer',
                                        fontFamily: 'inherit', transition: 'all 0.2s', flexShrink: 0,
                                        border: activeLesson.completed ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    }}
                                >
                                    {isToggling ? '⏳' : activeLesson.completed ? '✅ Terminée' : '☐ Marquer terminée'}
                                </button>
                            </div>

                            {/* Chat messages */}
                            <div style={{
                                flex: 1, overflowY: 'auto', padding: '1.25rem',
                                display: 'flex', flexDirection: 'column', gap: '1rem',
                            }}>
                                {chatMessages.length === 0 ? (
                                    <div style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        justifyContent: 'center', flex: 1, gap: '1rem', textAlign: 'center',
                                        padding: '3rem 2rem',
                                    }}>
                                        <div style={{
                                            width: '80px', height: '80px', borderRadius: '20px',
                                            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.3))',
                                            border: '1px solid rgba(99,102,241,0.3)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '2.5rem',
                                        }}>
                                            🤖
                                        </div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#e2e8f0' }}>
                                            Tuteur IA prêt !
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-tertiary)', maxWidth: '400px', lineHeight: 1.6 }}>
                                            Cliquez sur "Commencer la leçon" pour démarrer votre apprentissage interactif sur <strong style={{ color: '#a5b4fc' }}>{activeLesson.title}</strong>.
                                        </p>
                                        <button
                                            onClick={startLesson}
                                            disabled={isSending}
                                            style={{
                                                padding: '0.75rem 2rem',
                                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                color: 'white', border: 'none', borderRadius: '12px',
                                                cursor: isSending ? 'not-allowed' : 'pointer',
                                                fontWeight: '700', fontSize: '0.9rem', fontFamily: 'inherit',
                                                boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                                                transition: 'all 0.2s',
                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                marginTop: '0.5rem',
                                            }}
                                        >
                                            {isSending ? (
                                                <><span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>⏳</span> Démarrage...</>
                                            ) : (
                                                <>🚀 Commencer la leçon</>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    chatMessages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className="chat-msg"
                                            style={{
                                                display: 'flex',
                                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                                animationDelay: `${Math.min(i * 0.05, 0.3)}s`,
                                            }}
                                        >
                                            <div style={{
                                                maxWidth: msg.role === 'user' ? '70%' : '85%',
                                                padding: '0.85rem 1.1rem',
                                                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                background: msg.role === 'user'
                                                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                                    : 'rgba(25,25,40,0.8)',
                                                border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                                color: msg.role === 'user' ? 'white' : '#e2e8f0',
                                                fontSize: '0.88rem', lineHeight: '1.6',
                                                boxShadow: msg.role === 'user'
                                                    ? '0 4px 12px rgba(99,102,241,0.3)'
                                                    : '0 2px 8px rgba(0,0,0,0.2)',
                                            }}>
                                                {msg.role === 'assistant' ? (
                                                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                                                ) : (
                                                    msg.content
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}

                                {/* Typing indicator */}
                                {isSending && chatMessages.length > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                        <div style={{
                                            padding: '0.85rem 1.1rem', borderRadius: '16px 16px 16px 4px',
                                            background: 'rgba(25,25,40,0.8)', border: '1px solid rgba(255,255,255,0.08)',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        }}>
                                            <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                {[0, 0.2, 0.4].map((delay) => (
                                                    <div key={delay} style={{
                                                        width: '6px', height: '6px', borderRadius: '50%',
                                                        background: '#6366f1', animation: `pulse 1s ease-in-out ${delay}s infinite`,
                                                    }} />
                                                ))}
                                            </div>
                                            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Le tuteur réfléchit...</span>
                                        </div>
                                    </div>
                                )}

                                <div ref={chatEndRef} />
                            </div>

                            {/* Chat input */}
                            {chatMessages.length > 0 && (
                                <div style={{
                                    padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)',
                                    display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexShrink: 0,
                                }}>
                                    <textarea
                                        ref={inputRef}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="Posez une question au tuteur..."
                                        rows={1}
                                        style={{
                                            flex: 1, padding: '0.75rem 1rem', borderRadius: '12px',
                                            border: '1.5px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(15,23,42,0.6)', color: '#f1f5f9',
                                            fontSize: '0.88rem', fontFamily: 'inherit', resize: 'none',
                                            lineHeight: '1.5', outline: 'none', transition: 'border-color 0.2s',
                                            minHeight: '44px', maxHeight: '120px',
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    />
                                    <button
                                        className="program-send-btn"
                                        onClick={handleSend}
                                        disabled={!inputValue.trim() || isSending}
                                        style={{
                                            padding: '0.75rem 1.25rem', border: 'none', borderRadius: '12px',
                                            background: (!inputValue.trim() || isSending)
                                                ? 'rgba(99,102,241,0.2)'
                                                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            color: 'white', fontSize: '0.88rem', fontWeight: '700',
                                            cursor: (!inputValue.trim() || isSending) ? 'not-allowed' : 'pointer',
                                            fontFamily: 'inherit', transition: 'all 0.2s',
                                            boxShadow: (!inputValue.trim() || isSending) ? 'none' : '0 4px 12px rgba(99,102,241,0.35)',
                                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                                            flexShrink: 0, height: '44px',
                                        }}
                                    >
                                        {isSending ? (
                                            <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>⏳</span>
                                        ) : (
                                            <>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                                Envoyer
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', flex: 1, gap: '1rem', color: 'var(--text-tertiary)',
                        }}>
                            <span style={{ fontSize: '3rem', opacity: 0.5 }}>📖</span>
                            <p style={{ margin: 0, fontSize: '0.88rem' }}>Sélectionnez une leçon pour commencer</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgramDetailsPage;
