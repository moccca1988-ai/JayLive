'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocalParticipant } from '@livekit/components-react';
import { Send, ArrowLeft } from 'lucide-react';

export default function ReservationMessages({ role }: { role: 'host' | 'viewer' }) {
  const { localParticipant } = useLocalParticipant();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch(`/api/reservation-messaging/conversations?userId=${encodeURIComponent(localParticipant.identity)}&role=${role}`);
        const data = await res.json();
        setConversations(data.conversations || []);
      } catch (e) {
        console.error('Failed to fetch conversations', e);
      } finally {
        setLoading(false);
      }
    };

    const fetchMessages = async (conversationId: string) => {
      try {
        const res = await fetch(`/api/reservation-messaging/messages?conversationId=${conversationId}&userId=${encodeURIComponent(localParticipant.identity)}`);
        const data = await res.json();
        setMessages(data.messages || []);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (e) {
        console.error('Failed to fetch messages', e);
      }
    };

    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations();
      if (activeConversation) {
        fetchMessages(activeConversation.id);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [localParticipant.identity, activeConversation, role]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const text = newMessage;
    setNewMessage('');

    // Optimistic update
    const tempMessage = {
      id: Date.now().toString(),
      conversation_id: activeConversation.id,
      sender_id: localParticipant.identity,
      message_text: text,
      message_type: 'user',
      created_at: Date.now(),
    };
    setMessages(prev => [...prev, tempMessage]);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      await fetch('/api/reservation-messaging/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          userId: localParticipant.identity,
          messageText: text,
        }),
      });
      fetchConversations();
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  if (loading) {
    return <div className="text-white/50 p-4 text-center">Loading messages...</div>;
  }

  if (activeConversation) {
    return (
      <div className="flex flex-col h-full bg-[#141414]">
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <button 
            onClick={() => setActiveConversation(null)}
            className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-sm font-bold text-white">{activeConversation.drop_title}</h3>
            <p className="text-xs text-white/50">
              {role === 'host' ? activeConversation.viewer_id : activeConversation.host_id} • Option: {activeConversation.option_selected} • #{activeConversation.reservation_position}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {messages.map((msg) => {
            const isMe = msg.sender_id === localParticipant.identity;
            const isSystem = msg.message_type === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-4">
                  <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] px-4 py-2 rounded-full text-center max-w-[80%] whitespace-pre-wrap">
                    {msg.message_text}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[13px] ${
                    isMe 
                      ? 'bg-indigo-500 text-white rounded-br-sm' 
                      : 'bg-white/10 text-white rounded-bl-sm border border-white/5'
                  }`}
                >
                  {msg.message_text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-[#0A0A0A]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="p-2.5 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:hover:bg-indigo-500 cursor-pointer"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.length === 0 ? (
        <div className="text-center text-white/50 py-8">
          <p>No messages yet.</p>
        </div>
      ) : (
        conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => {
              setActiveConversation(conv);
              fetchMessages(conv.id);
            }}
            className="w-full text-left bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-sm text-white">
                {role === 'host' ? conv.viewer_id : conv.host_id}
              </span>
              <span className="text-[10px] text-white/40">
                {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="text-xs text-white/70 mb-2">
              {conv.drop_title} • {conv.option_selected} • #{conv.reservation_position}
            </div>
            <p className="text-xs text-white/50 truncate">
              {conv.last_message_type === 'system' ? 'System message' : conv.last_message}
            </p>
          </button>
        ))
      )}
    </div>
  );
}
