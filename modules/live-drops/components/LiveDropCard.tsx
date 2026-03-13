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

  useEffect(() => {
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
        className="absolute top-24 left-4 z-50 w-64 bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl pointer-events-auto"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-red-500/30">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            Live Drop
          </div>
          {drop.price && (
            <span className="text-white font-bold text-sm bg-white/10 px-2 py-0.5 rounded-md border border-white/5">
              {drop.price}
            </span>
          )}
        </div>

        <h3 className="text-white font-bold text-lg leading-tight mb-1">{drop.title}</h3>
        {drop.description && <p className="text-white/60 text-xs mb-3 line-clamp-2">{drop.description}</p>}

        {userReservation ? (
          <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
            <Check className="mx-auto text-green-400 mb-1" size={20} />
            <p className="text-green-400 text-xs font-bold uppercase tracking-wider mb-0.5">Reservation successful</p>
            <p className="text-white/80 text-xs">You are position #{userReservation.position} for {displayLabel.toLowerCase()} {userReservation.option_value}</p>
          </div>
        ) : drop.status === 'FULL' ? (
          <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-white/50 text-sm font-bold uppercase tracking-wider">Drop Sold Out</p>
          </div>
        ) : (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-3 bg-white text-black font-bold py-2.5 rounded-xl text-sm hover:bg-gray-200 active:scale-95 transition-all shadow-lg shadow-white/10 cursor-pointer"
          >
            Reserve Now
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2.5 bg-white/5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer active:scale-95"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold text-white mb-1">Choose {displayLabel.toLowerCase()}</h2>
              <p className="text-white/50 text-sm mb-6">{drop.title}</p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4 text-center font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2 mb-6">
                {options.map(s => {
                  const isAvailable = s.reserved < s.stock;
                  const isSelected = selectedOption === s.option_value;
                  
                  return (
                    <button
                      key={s.id}
                      disabled={!isAvailable}
                      onClick={() => setSelectedOption(s.option_value)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                        !isAvailable 
                          ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed' 
                          : isSelected 
                            ? 'bg-white/10 border-white text-white shadow-md' 
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/30 active:scale-[0.98]'
                      }`}
                    >
                      <span className="font-bold text-lg">{s.option_value}</span>
                      <span className="text-sm">
                        {isAvailable ? `${s.stock - s.reserved} available` : 'Sold out'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleReserve}
                disabled={!selectedOption || reserving}
                className="w-full bg-indigo-500 text-white font-bold py-4 rounded-xl text-[15px] hover:bg-indigo-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-indigo-500/20 cursor-pointer"
              >
                {reserving ? 'Reserving...' : 'Confirm Reservation'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
