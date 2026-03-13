'use client';

import { useState, useEffect } from 'react';
import { useRoomContext, useLocalParticipant } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { Drop, DropOption, DropReservation } from '@/modules/live-drops/server/db';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, Check, X } from 'lucide-react';

export default function LiveDropCard() {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  
  const [drop, setDrop] = useState<Drop | null>(null);
  const [options, setOptions] = useState<DropOption[]>([]);
  const [userReservation, setUserReservation] = useState<DropReservation | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrop = async () => {
      try {
        const res = await fetch(`/api/live-drops?userId=${encodeURIComponent(localParticipant.identity)}`);
        const data = await res.json();
        setDrop(data.drop);
        setOptions(data.options || []);
        setUserReservation(data.userReservation || null);
      } catch (e) {
        console.error('Failed to fetch drop', e);
      }
    };

    fetchDrop();

    const handleData = (payload: Uint8Array, participant: any, kind: any, topic?: string) => {
      try {
        const decoder = new TextDecoder();
        const str = decoder.decode(payload);
        const data = JSON.parse(str);
        if (data.type === 'DROP_UPDATED') {
          fetchDrop();
        }
      } catch (e) {
        // Ignore parsing errors
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room, localParticipant.identity]);

  const handleReserve = async () => {
    if (!selectedOption || !drop) return;
    setReserving(true);
    setError(null);

    try {
      const res = await fetch('/api/live-drops/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dropId: drop.id,
          userId: localParticipant.identity,
          optionValue: selectedOption
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to reserve');
      } else {
        setUserReservation(data.reservation);
        setIsModalOpen(false);
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setReserving(false);
    }
  };

  if (!drop || drop.status === 'ENDED') return null;

  const displayLabel = options.length > 0 ? options[0].option_label : 'Option';

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="absolute top-24 left-4 z-50 w-72 glass-card p-5 pointer-events-auto"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 bg-[#EF4444]/15 text-[#EF4444] px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border border-[#EF4444]/20">
            <span className="w-1.5 h-1.5 bg-[#EF4444] rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            Live Drop
          </div>
          {drop.price && (
            <span className="text-white font-black text-sm bg-white/10 px-2.5 py-1 rounded-lg border border-white/5">
              {drop.price}
            </span>
          )}
        </div>

        <h3 className="text-white font-black text-lg leading-tight mb-1 tracking-tight">{drop.title}</h3>
        {drop.description && <p className="text-white/50 text-xs mb-4 line-clamp-2 leading-relaxed">{drop.description}</p>}

        {userReservation ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-4 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-2xl p-4 text-center shadow-[0_0_20px_rgba(34,197,94,0.15)]"
          >
            <div className="w-10 h-10 bg-[#22C55E]/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="text-[#22C55E]" size={20} strokeWidth={3} />
            </div>
            <p className="text-[#22C55E] text-[11px] font-black uppercase tracking-[0.1em] mb-1">Reserved</p>
            <p className="text-white/80 text-xs leading-relaxed">Position #{userReservation.position} for {displayLabel.toLowerCase()} {options.find(o => o.id === userReservation.option_id)?.option_value}</p>
          </motion.div>
        ) : drop.status === 'FULL' ? (
          <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-white/40 text-xs font-black uppercase tracking-[0.1em]">Sold Out</p>
          </div>
        ) : (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-4 btn-primary py-3.5 text-white font-black text-sm tracking-tight cursor-pointer"
          >
            Reserve Now
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-sm glass-card p-8 shadow-2xl"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer active:scale-90"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Select {displayLabel}</h2>
              <p className="text-white/40 text-sm mb-8 font-medium">{drop.title}</p>

              {error && (
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs p-4 rounded-2xl mb-6 text-center font-black uppercase tracking-wider">
                  {error}
                </div>
              )}

              <div className="space-y-3 mb-8">
                {options.map(s => {
                  const isAvailable = s.reserved < s.stock;
                  const isSelected = selectedOption === s.option_value;
                  
                  return (
                    <button
                      key={s.id}
                      disabled={!isAvailable}
                      onClick={() => setSelectedOption(s.option_value)}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${
                        !isAvailable 
                          ? 'bg-white/5 border-white/5 opacity-30 cursor-not-allowed' 
                          : isSelected 
                            ? 'bg-white/10 border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/30 active:scale-[0.98]'
                      }`}
                    >
                      <span className="font-black text-lg tracking-tight">{s.option_value}</span>
                      <span className={`text-xs font-bold ${isAvailable ? 'text-[#5EEAD4]' : 'text-white/30'}`}>
                        {isAvailable ? `${s.stock - s.reserved} left` : 'Sold out'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleReserve}
                disabled={!selectedOption || reserving}
                className="w-full btn-primary py-4 text-white font-black text-[15px] tracking-tight disabled:opacity-30 disabled:grayscale cursor-pointer"
              >
                {reserving ? 'Processing...' : 'Confirm Reservation'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
