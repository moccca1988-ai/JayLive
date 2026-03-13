'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalParticipant } from '@livekit/components-react';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

import { Conversation, Message } from '@/modules/reservation-messaging/server/db';

export default function ReservationMessages({ role }: { role: 'host' | 'viewer' }) {
  const { localParticipant } = useLocalParticipant();
  const [conversations, setConversations] = useState<(Conversation & { drop_title: string, last_message: string, last_message_type: string })[]>([]);
  const [activeConversation, setActiveConversation] = useState<(Conversation & { drop_title: string }) | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`/api/reservation-messaging/conversations?userId=${encodeURIComponent(localParticipant.identity)}&role=${role}`);
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (e) {
      console.error('Failed to fetch conversations', e);
    } finally {
      setLoading(false);
    }
  }, [localParticipant.identity, role]);

  const fetchMessages = useCallback(async (conversationId: string) => {
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
  }, [localParticipant.identity]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations();
      if (activeConversation) {
        fetchMessages(activeConversation.id);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [fetchConversations, fetchMessages, activeConversation]);

  const handleUpdateStatus = async (status: string) => {
    if (!activeConversation) return;

    try {
      await fetch('/api/reservation-messaging/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          userId: localParticipant.identity,
          status,
        }),
      });
      setActiveConversation(prev => prev ? { ...prev, status: status as any } : null);
      fetchConversations();
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const text = newMessage;
    setNewMessage('');

    // Optimistic update
    const tempMessage: Message = {
      id: Date.now().toString(),
      conversation_id: activeConversation.id,
      sender_id: localParticipant.identity,
      message_text: text,
      message_type: 'user' as const,
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
      <div className="flex flex-col h-full bg-transparent">
          <div className="flex items-center gap-4 p-5 border-b border-white/5">
            <button 
              onClick={() => setActiveConversation(null)}
              className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer active:scale-90"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1">
              <h3 className="text-sm font-black text-white tracking-tight">{activeConversation.drop_title}</h3>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-0.5">
                {role === 'host' ? activeConversation.viewer_id : activeConversation.host_id} • {activeConversation.option_selected} • #{activeConversation.reservation_position}
              </p>
            </div>
            {role === 'host' && (
              <select 
                value={activeConversation.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/60 focus:outline-none focus:border-white/30 cursor-pointer transition-all"
              >
                <option value="contacted">Contacted</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            )}
          </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
          {messages.map((msg) => {
            const isMe = msg.sender_id === localParticipant.identity;
            const isSystem = msg.message_type === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-6">
                  <div className="bg-[#7C6CFF]/10 border border-[#7C6CFF]/20 text-[#7C6CFF] text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full text-center max-w-[85%] whitespace-pre-wrap shadow-sm">
                    {msg.message_text}
                  </div>
                </div>
              );
            }

            return (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={msg.id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-[14px] font-medium leading-relaxed shadow-lg ${
                    isMe 
                      ? 'bg-[#7C6CFF] text-white rounded-br-sm' 
                      : 'glass text-white rounded-bl-sm'
                  }`}
                >
                  {msg.message_text}
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-5 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 glass rounded-full px-6 py-4 text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-white/10 placeholder:text-white/20 font-medium"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="btn-primary w-14 h-14 flex items-center justify-center disabled:opacity-30 disabled:grayscale transition-all"
            >
              <Send size={20} strokeWidth={3} className="text-white" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
            <MessageSquare size={24} className="text-white/20" />
          </div>
          <p className="text-white/30 font-black uppercase tracking-widest text-[10px]">No messages yet</p>
        </div>
      ) : (
        conversations.map((conv) => (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            key={conv.id}
            onClick={() => {
              setActiveConversation(conv);
              fetchMessages(conv.id);
            }}
            className="w-full text-left glass rounded-2xl p-5 hover:bg-white/10 transition-all cursor-pointer group shadow-lg"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-black text-sm text-white tracking-tight group-hover:text-[#5EEAD4] transition-colors">
                {role === 'host' ? conv.viewer_id : conv.host_id}
              </span>
              <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">
                {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-3">
              {conv.drop_title} • {conv.option_selected} • #{conv.reservation_position}
            </div>
            <p className="text-xs text-white/60 truncate font-medium leading-relaxed">
              {conv.last_message_type === 'system' ? 'System update' : conv.last_message}
            </p>
          </motion.button>
        ))
      )}
    </div>
  );
}
