'use client';

import { useChat } from '@livekit/components-react';
import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function Chat() {
  const { send, chatMessages, isSending } = useChat();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      await send(message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="absolute bottom-20 left-4 w-72 max-h-64 flex flex-col justify-end pointer-events-none z-40">
      <div className="overflow-y-auto mb-4 flex flex-col gap-2 no-scrollbar pointer-events-auto max-h-48">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-2 text-sm w-fit max-w-full break-words">
            <span className="font-bold text-white/80 mr-2">{msg.from?.name || 'User'}:</span>
            <span className="text-white">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pointer-events-auto">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Sag etwas..."
          className="flex-1 bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-white/50 text-white placeholder:text-white/50"
        />
        <button
          type="submit"
          disabled={isSending || !message.trim()}
          className="bg-white/20 backdrop-blur-md border border-white/20 rounded-full p-2 flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50"
        >
          <Send size={18} className="text-white" />
        </button>
      </form>
    </div>
  );
}
