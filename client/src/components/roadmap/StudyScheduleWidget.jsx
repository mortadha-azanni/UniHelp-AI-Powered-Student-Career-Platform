import { useState } from 'react';

const CalendarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const ClockIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const CheckCircleIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const ChevronDownIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const ChevronUpIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>;

const StudyScheduleWidget = ({ schedule, onToggleTask, onClose }) => {
    const [expandedDay, setExpandedDay] = useState(1);

    if (!schedule) return null;

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(9, 9, 11, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end', zIndex: 100 }}>
            {/* Sliding Panel */}
            <div style={{ 
                width: '380px', height: '100%', backgroundColor: '#18181b', 
                borderLeft: '1px solid #27272a', display: 'flex', flexDirection: 'column', 
                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)', animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' 
            }}>
                <style>{`
                    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                    /* Custom checkbox styling */
                    .custom-task-checkbox {
                        appearance: none;
                        background-color: #09090b;
                        margin: 0; font: inherit; color: currentColor;
                        width: 1.15em; height: 1.15em; border: 1.5px solid #52525b; border-radius: 4px;
                        display: grid; place-content: center; cursor: pointer; transition: all 0.2s;
                    }
                    .custom-task-checkbox::before {
                        content: ""; width: 0.65em; height: 0.65em; transform: scale(0);
                        transition: 120ms transform ease-in-out;
                        box-shadow: inset 1em 1em white;
                        background-color: white; transform-origin: center;
                        clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
                    }
                    .custom-task-checkbox:checked { background-color: #3b82f6; border-color: #3b82f6; }
                    .custom-task-checkbox:checked::before { transform: scale(1); }
                `}</style>
                
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ color: '#3b82f6' }}>
                            <CalendarIcon />
                        </div>
                        <h3 style={{ margin: 0, color: '#f4f4f5', fontSize: '1.15rem', fontWeight: '600', letterSpacing: '-0.01em' }}>
                            Plan d'Études
                        </h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                </div>

                {/* Progress Mini-Dashboard */}
                <div style={{ padding: '1.5rem 1.5rem 1rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #27272a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', color: '#a1a1aa' }}>
                        <span style={{ fontWeight: '500' }}>Progression Globale</span>
                        <span style={{ fontWeight: '700', color: '#f4f4f5' }}>{schedule.progress}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#27272a', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${schedule.progress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.4s ease' }}></div>
                    </div>
                </div>

                {/* Days List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {schedule.days.map((day) => {
                        const isExpanded = expandedDay === day.dayNumber;
                        const dayCompleted = day.tasks.length > 0 && day.tasks.every(t => t.completed);

                        return (
                            <div key={day.dayNumber} style={{
                                border: `1px solid ${dayCompleted ? 'rgba(16, 185, 129, 0.3)' : isExpanded ? '#3f3f46' : '#27272a'}`,
                                borderRadius: '10px',
                                background: dayCompleted ? 'rgba(16, 185, 129, 0.03)' : '#09090b',
                                transition: 'all 0.2s ease',
                                overflow: 'hidden'
                            }}>
                                {/* Day Header */}
                                <div
                                    onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                                    style={{
                                        padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        cursor: 'pointer', background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{
                                            fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase',
                                            padding: '0.2rem 0.5rem', borderRadius: '6px',
                                            background: dayCompleted ? '#10b981' : '#3f3f46',
                                            color: dayCompleted ? '#064e3b' : '#f4f4f5'
                                        }}>
                                            Jour {day.dayNumber}
                                        </span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '500', color: dayCompleted ? '#10b981' : '#e4e4e7' }}>
                                            {day.focusArea}
                                        </span>
                                    </div>
                                    <div style={{ color: '#71717a' }}>
                                        {dayCompleted ? <span style={{ color: '#10b981' }}><CheckCircleIcon /></span> : isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                    </div>
                                </div>

                                {/* Tasks Body */}
                                {isExpanded && (
                                    <div style={{ borderTop: '1px solid #27272a', padding: '0.5rem 0' }}>
                                        {day.tasks.map((task) => (
                                            <div key={task._id} style={{
                                                display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem',
                                                background: task.completed ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                                                borderLeft: task.completed ? '2px solid #10b981' : '2px solid transparent',
                                                transition: 'all 0.2s'
                                            }}>
                                                <div style={{ paddingTop: '0.1rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        className="custom-task-checkbox"
                                                        checked={task.completed}
                                                        onChange={() => onToggleTask(task._id)}
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{
                                                        margin: '0 0 0.4rem 0', fontSize: '0.85rem', lineHeight: '1.4',
                                                        color: task.completed ? '#a1a1aa' : '#f4f4f5',
                                                        textDecoration: task.completed ? 'line-through' : 'none',
                                                        transition: 'all 0.2s'
                                                    }}>
                                                        {task.taskDescription}
                                                    </p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: '#71717a' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                            <ClockIcon /> {task.estimatedMinutes} min
                                                        </span>
                                                        <span style={{ color: '#52525b' }}>•</span>
                                                        <span style={{ fontFamily: 'monospace', background: '#27272a', padding: '1px 4px', borderRadius: '4px' }}>
                                                            Nœud: {task.nodeId.replace('node_', '')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StudyScheduleWidget;
