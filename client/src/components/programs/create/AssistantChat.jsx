// ─── AssistantChat ────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

const INITIAL_MESSAGES = [
    { id: '1', role: 'assistant', text: "Bonjour ! 👋 Je suis votre assistant IA pour créer des programmes d'apprentissage personnalisés. Décrivez-moi l'objectif de votre programme.", timestamp: '00:00' },
    { id: '2', role: 'user', text: "Je veux créer un programme pour apprendre React de zéro jusqu'au niveau avancé.", timestamp: '00:01' },
    { id: '3', role: 'assistant', text: "Parfait ! J'ai bien noté l'objectif. 🎯 Pour vous proposer un programme adapté :\n\n• Quel est votre niveau actuel en JavaScript ?\n• Combien d'heures par semaine pouvez-vous consacrer ?\n• Avez-vous une date limite ?", timestamp: '00:01' },
    { id: '4', role: 'user', text: "Je connais les bases de JS. Je peux consacrer environ 10h/semaine. Pas de deadline stricte.", timestamp: '00:02' },
    { id: '5', role: 'assistant', text: "✅ Sur la base de vos réponses, j'ai généré un programme en 5 modules sur 12 semaines :\n\n1. Fondations React & JSX\n2. Gestion d'état & Hooks\n3. Patterns Avancés\n4. Performance & Optimisation\n5. Tests & Déploiement\n\nL'aperçu est mis à jour →", timestamp: '00:03' },
    { id: '6', role: 'user', text: "Super ! Peut-on ajouter un module sur React Native ?", timestamp: '00:04' },
    { id: '7', role: 'assistant', text: "Bien sûr ! 📱 J'ai ajouté un Module 6 : React Native & Expo. La durée passe à 15 semaines. Souhaitez-vous ajuster autre chose ?", timestamp: '00:04' },
];

const SUGGESTIONS = ['Ajouter un module', 'Changer le niveau', 'Raccourcir la durée', 'Voir les détails'];

const AssistantChat = () => {
    const [input, setInput] = useState('');
    const [inputFocused, setInputFocused] = useState(false);
    const [sendHovered, setSendHovered] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(15,15,25,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, background: 'rgba(20,20,35,0.8)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(99,102,241,0.5)', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M9 11a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2m6 0a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2z" />
                    </svg>
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>Assistant IA</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.7)', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                        <span style={{ fontSize: '0.72rem', color: '#34d399' }}>En ligne</span>
                    </div>
                </div>
                <span style={{ marginLeft: 'auto', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '8px', padding: '0.2rem 0.6rem', fontSize: '0.65rem', fontWeight: '700', color: '#818cf8' }}>AI · Mock</span>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
                {INITIAL_MESSAGES.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
                <div ref={bottomRef} />
            </div>

            {/* Chips */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', padding: '0 1.25rem 0.75rem', flexShrink: 0 }}>
                {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => setInput(s)}
                        style={{ padding: '0.28rem 0.75rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.22)', borderRadius: '20px', color: '#818cf8', fontSize: '0.72rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.45)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.22)'; }}>
                        {s}
                    </button>
                ))}
            </div>

            {/* Input bar */}
            <div style={{ display: 'flex', gap: '0.6rem', padding: '0.85rem 1.1rem', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,15,25,0.9)', flexShrink: 0, alignItems: 'flex-end' }}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setInput(''); } }}
                    placeholder="Décrivez votre programme ou posez une question…"
                    rows={2}
                    style={{ flex: 1, background: inputFocused ? 'rgba(35,35,55,0.9)' : 'rgba(25,25,40,0.7)', border: `1px solid ${inputFocused ? 'rgba(99,102,241,0.45)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', padding: '0.65rem 0.9rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none', resize: 'none', lineHeight: 1.5, transition: 'border-color 0.18s ease', boxShadow: inputFocused ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none' }}
                />
                <button
                    onClick={() => setInput('')}
                    disabled={!input.trim()}
                    onMouseEnter={() => setSendHovered(true)}
                    onMouseLeave={() => setSendHovered(false)}
                    style={{ width: '42px', height: '42px', borderRadius: '12px', background: input.trim() ? (sendHovered ? 'linear-gradient(135deg,#5254cc,#7c3abf)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)') : 'rgba(255,255,255,0.07)', border: 'none', color: input.trim() ? '#ffffff' : 'rgba(255,255,255,0.25)', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: input.trim() && sendHovered ? '0 4px 16px rgba(99,102,241,0.5)' : input.trim() ? '0 2px 10px rgba(99,102,241,0.3)' : 'none', transform: input.trim() && sendHovered ? 'translateY(-1px)' : 'translateY(0)', transition: 'all 0.18s ease' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default AssistantChat;
