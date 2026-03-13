'use client';

import { useChat } from '@livekit/components-react';
import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'motion/react';

export default function Chat() {
  const { send, chatMessages, isSending } = useChat();
  const [message, setMessage] = useState('');
  const [fontStyle, setFontStyle] = useState('standard');
  const [textColor, setTextColor] = useState('white');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fonts: Record<string, string> = {
    standard: 'font-sans',
    elegant: 'font-serif',
    modern: 'font-mono',
    italic: 'italic font-sans'
  };

  const colors: Record<string, string> = {
    white: 'text-white',
    gray: 'text-gray-400',
    blue: 'text-blue-400',
    pink: 'text-pink-400',
    green: 'text-green-400'
  };

  const colorValues: Record<string, string> = {
    white: '#FFFFFF',
    gray: '#9CA3AF',
    blue: '#60A5FA',
    pink: '#F472B6',
    green: '#34D399'
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      const styledMessage = `[${fontStyle},${textColor}]${message}`;
      await send(styledMessage);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const parseMessage = (msg: string) => {
    const match = msg.match(/^\[(.*?),(.*?)\](.*)$/);
    if (match) {
      return {
        font: match[1],
        color: match[2],
        text: match[3]
      };
    }
    return { font: 'standard', color: 'white', text: msg };
  };

  return (
    <div className="absolute bottom-8 left-4 right-4 md:right-auto md:w-[340px] max-h-96 flex flex-col justify-end pointer-events-none z-40 pb-safe">
      <div className="overflow-y-auto mb-4 flex flex-col gap-2.5 no-scrollbar pointer-events-auto max-h-56 mask-image-b-fade px-1">
        {chatMessages.map((msg, idx) => {
          const parsed = parseMessage(msg.message);
          return (
            <motion.div 
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              key={idx} 
              className="glass rounded-2xl px-4 py-2.5 text-[14px] w-fit max-w-full break-words shadow-lg"
            >
              <span className="font-black text-white/40 text-[11px] uppercase tracking-wider mr-2">{msg.from?.name || 'User'}</span>
              <span className={`${fonts[parsed.font] || fonts.standard} ${colors[parsed.color] || colors.white} font-medium`}>
                {parsed.text}
              </span>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-col gap-3 pointer-events-auto">
        {/* Style Controls */}
        <div className="flex items-center justify-between glass rounded-2xl p-2.5 gap-3 shadow-2xl">
          <div className="flex gap-1.5">
            {Object.keys(fonts).map((f) => (
              <button
                key={f}
                onClick={() => setFontStyle(f)}
                className={`text-[10px] px-2.5 py-1.5 rounded-lg transition-all font-black uppercase tracking-wider ${
                  fontStyle === f ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
                } ${fonts[f]}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {Object.keys(colors).map((c) => (
              <button
                key={c}
                onClick={() => setTextColor(c)}
                className={`w-4 h-4 rounded-full border border-white/10 transition-all ${
                  textColor === c ? 'scale-125 border-white ring-2 ring-white/20' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: colorValues[c] }}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSend} className="flex gap-2.5">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Say something..."
            className={`flex-1 glass rounded-full px-6 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-white/10 placeholder:text-white/30 shadow-2xl transition-all ${fonts[fontStyle]} ${colors[textColor]} font-medium`}
          />
          <button
            type="submit"
            disabled={isSending || !message.trim()}
            className="btn-primary w-14 h-14 flex items-center justify-center disabled:opacity-30 disabled:grayscale transition-all"
          >
            <Send size={20} strokeWidth={3} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
