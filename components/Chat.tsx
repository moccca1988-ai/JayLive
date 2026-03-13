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
    <div className="absolute bottom-8 left-4 right-4 md:right-auto md:w-[320px] max-h-64 flex flex-col justify-end pointer-events-none z-40 pb-safe">
      <div className="overflow-y-auto mb-3 flex flex-col gap-2 no-scrollbar pointer-events-auto max-h-48 mask-image-b-fade">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl px-3.5 py-2 text-[14px] w-fit max-w-full break-words shadow-sm">
            <span className="font-semibold text-white/70 mr-2">{msg.from?.name || 'User'}</span>
            <span className="text-white/95">{msg.message}</span>
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
          className="flex-1 bg-black/30 backdrop-blur-xl border border-white/20 rounded-full px-5 py-3 text-[15px] focus:outline-none focus:border-white/40 text-white placeholder:text-white/60 shadow-sm transition-colors"
        />
        <button
          type="submit"
          disabled={isSending || !message.trim()}
          className="bg-white text-black rounded-full p-3 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-sm"
        >
          <Send size={18} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}
