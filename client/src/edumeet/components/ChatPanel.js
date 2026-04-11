import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

/**
 * Chat panel — displays messages and sends new ones via WebSocket.
 */
export default function ChatPanel({ events, send, user }) {
    const [text, setText] = useState('');
    const endRef = useRef(null);

    const chatMessages = events.filter(e => e.type === 'chat_message');

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages.length]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        send('chat_message', { text: text.trim() });
        setText('');
    };

    return (
        <div className="edm-chat">
            <div className="edm-chat-header">Chat</div>
            <div className="edm-chat-messages">
                {chatMessages.length === 0 && (
                    <p className="edm-chat-empty">No messages yet. Say hello!</p>
                )}
                {chatMessages.map((msg, i) => {
                    const name = msg.payload?.name || msg.from || 'Unknown';
                    const isMe = msg.from === (user?.id || user?.studentId);
                    return (
                        <div key={i} className={`edm-chat-msg ${isMe ? 'me' : ''}`}>
                            <span className="edm-chat-name">{name}</span>
                            <span className="edm-chat-text">{msg.payload?.text}</span>
                        </div>
                    );
                })}
                <div ref={endRef} />
            </div>
            <form className="edm-chat-input" onSubmit={handleSend}>
                <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Type a message..."
                    autoComplete="off"
                />
                <button type="submit"><FaPaperPlane /></button>
            </form>
        </div>
    );
}
