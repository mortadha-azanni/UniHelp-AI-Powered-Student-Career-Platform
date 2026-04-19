// ─── ChatMessage ──────────────────────────────────────────────────────────
const BotAvatar = () => (
    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(99,102,241,0.4)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M9 11a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2m6 0a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2z" />
        </svg>
    </div>
);

const ChatMessage = ({ message }) => {
    const isAssistant = message.role === 'assistant';
    return (
        <div style={{ display: 'flex', flexDirection: isAssistant ? 'row' : 'row-reverse', alignItems: 'flex-end', gap: '0.6rem' }}>
            {isAssistant && <BotAvatar />}
            <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: isAssistant ? 'flex-start' : 'flex-end' }}>
                <div style={{ padding: '0.7rem 1rem', borderRadius: isAssistant ? '4px 16px 16px 16px' : '16px 4px 16px 16px', background: isAssistant ? 'rgba(99,102,241,0.12)' : 'linear-gradient(135deg,rgba(99,102,241,0.8),rgba(139,92,246,0.8))', border: isAssistant ? '1px solid rgba(99,102,241,0.2)' : 'none', color: isAssistant ? 'var(--text-primary)' : '#ffffff', fontSize: '0.85rem', lineHeight: '1.55', backdropFilter: 'blur(8px)', boxShadow: isAssistant ? 'none' : '0 4px 14px rgba(99,102,241,0.3)', whiteSpace: 'pre-line' }}>
                    {message.text}
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', paddingInline: '0.2rem' }}>{message.timestamp}</span>
            </div>
        </div>
    );
};

export default ChatMessage;
