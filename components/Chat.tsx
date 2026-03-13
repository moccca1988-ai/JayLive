'use client';

import { useChat } from '@livekit/components-react';
import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

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
    <div className="absolute bottom-8 left-4 right-4 md:right-auto md:w-[320px] max-h-80 flex flex-col justify-end pointer-events-none z-40 pb-safe">
      <div className="overflow-y-auto mb-3 flex flex-col gap-2 no-scrollbar pointer-events-auto max-h-48 mask-image-b-fade">
        {chatMessages.map((msg, idx) => {
          const parsed = parseMessage(msg.message);
          return (
            <div key={idx} className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl px-3.5 py-2 text-[14px] w-fit max-w-full break-words shadow-sm">
              <span className="font-semibold text-white/70 mr-2">{msg.from?.name || 'User'}</span>
              <span className={`${fonts[parsed.font] || fonts.standard} ${colors[parsed.color] || colors.white}`}>
                {parsed.text}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-col gap-2 pointer-events-auto">
        {/* Style Controls */}
        <div className="flex items-center justify-between bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-2 gap-2">
          <div className="flex gap-1.5">
            {Object.keys(fonts).map((f) => (
              <button
                key={f}
                onClick={() => setFontStyle(f)}
                className={`text-[10px] px-2 py-1 rounded-md transition-all ${
                  fontStyle === f ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'
                } capitalize ${fonts[f]}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {Object.keys(colors).map((c) => (
              <button
                key={c}
                onClick={() => setTextColor(c)}
                className={`w-4 h-4 rounded-full border border-white/20 transition-all ${
                  textColor === c ? 'scale-125 border-white' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: colorValues[c] }}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Sag etwas..."
            className={`flex-1 bg-black/30 backdrop-blur-xl border border-white/20 rounded-full px-5 py-3 text-[15px] focus:outline-none focus:border-white/40 placeholder:text-white/60 shadow-sm transition-colors ${fonts[fontStyle]} ${colors[textColor]}`}
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
    </div>
  );
}
