'use client';

import { useChat } from '@livekit/components-react';
import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'motion/react';

export default function Chat() {
  const { send, chatMessages, isSending } = useChat();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll smoothly to the bottom when new messages arrive
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

  // Keep a simple parser just in case old formatted messages are still in the history
  const parseMessage = (msg: string) => {
    const match = msg.match(/^\[(.*?),(.*?)\](.*)$/);
    if (match) {
      return match[3];
    }
    return msg;
  };

  return (
    <div className="absolute bottom-8 left-4 right-4 md:right-auto md:w-[340px] max-h-96 flex flex-col justify-end pointer-events-none z-40 pb-safe">
      <div className="overflow-y-auto mb-4 flex flex-col gap-3 no-scrollbar pointer-events-auto max-h-64 mask-image-b-fade px-1">
        {chatMessages.map((msg, idx) => {
          const text = parseMessage(msg.message);
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              key={msg.id || idx} 
              className="glass rounded-2xl px-4 py-3 text-[15px] w-fit max-w-full break-words shadow-lg border border-white/10"
            >
              <span className="font-black text-white/50 text-[11px] uppercase tracking-wider mr-2 block mb-0.5">{msg.from?.name || 'User'}</span>
              <span className="text-white font-bold drop-shadow-md leading-snug">
                {text}
              </span>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      <div className="flex flex-col gap-3 pointer-events-auto">
        <form onSubmit={handleSend} className="flex gap-2.5">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Sag etwas..."
            className="flex-1 glass rounded-full px-6 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-white/40 shadow-2xl transition-all text-white font-semibold"
          />
          <button
            type="submit"
            disabled={isSending || !message.trim()}
            className="btn-primary w-14 h-14 flex items-center justify-center disabled:opacity-30 disabled:grayscale transition-all shrink-0"
          >
            <Send size={20} strokeWidth={3} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
