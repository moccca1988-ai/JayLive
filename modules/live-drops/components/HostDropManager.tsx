'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Drop, DropOption, DropReservation } from '@/modules/live-drops/server/db';
import { Conversation } from '@/modules/reservation-messaging/server/db';
import { Plus, Trash2, CheckCircle, XCircle, MessageSquare, ArrowLeft, Package, ShoppingBag } from 'lucide-react';

export default function HostDropManager({ onViewMessages }: { onViewMessages?: () => void }) {
  const [drop, setDrop] = useState<Drop | null>(null);
  const [options, setOptions] = useState<DropOption[]>([]);
  const [reservations, setReservations] = useState<DropReservation[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEndedSummary, setShowEndedSummary] = useState(false);
  const [lastEndedDrop, setLastEndedDrop] = useState<{ drop: Drop, options: DropOption[], reservations: DropReservation[] } | null>(null);

  // Refs for polling logic to avoid dependency loops
  const stateRef = useRef({ drop, options, reservations, showEndedSummary });
  useEffect(() => {
    stateRef.current = { drop, options, reservations, showEndedSummary };
  }, [drop, options, reservations, showEndedSummary]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [optionLabel, setOptionLabel] = useState('Size');
  const [optionInputs, setOptionInputs] = useState<{ value: string, stock: string }[]>([
    { value: 'S', stock: '' },
    { value: 'M', stock: '' },
    { value: 'L', stock: '' },
    { value: 'XL', stock: '' }
  ]);

  const fetchDrop = useCallback(async () => {
    try {
      const res = await fetch('/api/live-drops/host');
      const data = await res.json();
      if (data.drop) {
        setDrop(data.drop);
        setOptions(data.options || []);
        setReservations(data.reservations || []);
        setConversations(data.conversations || []);
        setShowEndedSummary(false);
      } else {
        // If we had an active drop and it's gone, show summary if we just ended it
        const { drop: currentDrop, options: currentOptions, reservations: currentReservations, showEndedSummary: currentlyShowingSummary } = stateRef.current;
        if (currentDrop && !currentlyShowingSummary) {
          setLastEndedDrop({ drop: currentDrop, options: currentOptions, reservations: currentReservations });
          setShowEndedSummary(true);
        }
        setDrop(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrop();
    const interval = setInterval(fetchDrop, 3000); // Poll for updates
    return () => clearInterval(interval);
  }, [fetchDrop]);

  const handleStartDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    // Filter out empty options
    const activeOptions: Record<string, string> = {};
    optionInputs.forEach(opt => {
      if (opt.value.trim() !== '' && opt.stock !== '' && Number(opt.stock) > 0) {
        activeOptions[opt.value.trim()] = opt.stock;
      }
    });

    if (Object.keys(activeOptions).length === 0) {
      alert('Please add at least one option with stock');
      return;
    }

    try {
      await fetch('/api/live-drops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          title,
          description,
          price,
          optionLabel: optionLabel.trim() || 'Option',
          options: activeOptions
        })
      });
      setTitle('');
      setDescription('');
      setPrice('');
      setOptionLabel('Size');
      setOptionInputs([
        { value: 'S', stock: '' },
        { value: 'M', stock: '' },
        { value: 'L', stock: '' },
        { value: 'XL', stock: '' }
      ]);
      fetchDrop();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEndDrop = async () => {
    if (!confirm('Are you sure you want to end this drop?')) return;
    try {
      setLastEndedDrop({ drop: drop!, options, reservations });
      await fetch('/api/live-drops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'END' })
      });
      setShowEndedSummary(true);
      setDrop(null);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleContacted = async (reservationId: string) => {
    try {
      await fetch('/api/live-drops/host/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TOGGLE_CONTACTED', reservationId })
      });
      fetchDrop();
    } catch (e) {
      console.error(e);
    }
  };

  const removeReservation = async (reservationId: string) => {
    if (!confirm('Remove this reservation?')) return;
    try {
      await fetch('/api/live-drops/host/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REMOVE', reservationId })
      });
      fetchDrop();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && !drop && !showEndedSummary) return <div className="text-white/50 p-4">Loading...</div>;

  if (showEndedSummary && lastEndedDrop) {
    const { drop: d, options: opts, reservations: resvs } = lastEndedDrop;
    const totalStock = opts.reduce((acc, s) => acc + s.stock, 0);
    const totalReserved = opts.reduce((acc, s) => acc + s.reserved, 0);

    return (
      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Drop Ended</h3>
          <p className="text-white/50 text-sm mb-6">{d.title}</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
              <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Total Sold</p>
              <p className="text-2xl font-bold text-white">{totalReserved}</p>
            </div>
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
              <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Stock Level</p>
              <p className="text-2xl font-bold text-white">{Math.round((totalReserved / totalStock) * 100)}%</p>
            </div>
          </div>

          <button 
            onClick={() => setShowEndedSummary(false)}
            className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-all active:scale-95 cursor-pointer"
          >
            Create New Drop
          </button>
        </div>
      </div>
    );
  }

  if (drop) {
    const totalStock = options.reduce((acc, s) => acc + s.stock, 0);
    const totalReserved = options.reduce((acc, s) => acc + s.reserved, 0);
    const displayLabel = options.length > 0 ? options[0].option_label : 'Option';

    return (
      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${drop.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                <h3 className="text-lg font-bold text-white">{drop.title}</h3>
              </div>
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest">{drop.status}</p>
            </div>
            <button 
              onClick={handleEndDrop}
              className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all cursor-pointer active:scale-95"
            >
              End Drop
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] text-white/40 mb-1 uppercase font-bold tracking-widest">Total Stock</p>
              <p className="text-2xl font-bold text-white">{totalStock}</p>
            </div>
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] text-white/40 mb-1 uppercase font-bold tracking-widest">Reserved</p>
              <p className="text-2xl font-bold text-white">{totalReserved}</p>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Inventory Breakdown</h4>
            <div className="grid gap-2">
              {options.map(s => (
                <div key={s.id} className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                  <span className="text-sm text-white font-bold">{s.option_value}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{s.reserved} <span className="text-white/30 font-normal">/ {s.stock}</span></p>
                    <p className="text-[10px] text-white/40 uppercase font-bold">{s.stock - s.reserved} left</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Active Reservations</h4>
            {options.map(s => {
              const optionReservations = reservations.filter(r => r.option_id === s.id).sort((a, b) => a.position - b.position);
              if (optionReservations.length === 0) return null;
              
              return (
                <div key={s.id} className="space-y-2">
                  <h5 className="text-[10px] font-bold text-indigo-400/70 uppercase tracking-widest px-1">{displayLabel} {s.option_value}</h5>
                  {optionReservations.map(r => {
                    const conv = conversations.find(c => c.reservation_id === r.id);
                    return (
                      <div key={r.id} className="group bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold text-white">
                              {r.position}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{r.user_id}</p>
                              <p className="text-[10px] text-white/40 font-bold uppercase">{new Date(r.created_at).toLocaleTimeString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => toggleContacted(r.id)}
                              className={`p-2 rounded-xl transition-all cursor-pointer active:scale-95 border ${r.contacted ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 text-white/20 border-white/5 hover:text-white/60'}`}
                              title="Mark as contacted"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => removeReservation(r.id)}
                              className="p-2 rounded-xl bg-white/5 text-white/20 border border-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all cursor-pointer active:scale-95"
                              title="Remove reservation"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        
                        {conv && (
                          <button 
                            onClick={onViewMessages}
                            className="w-full mt-3 pt-3 border-t border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group/msg"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <MessageSquare size={14} className="text-indigo-400 flex-shrink-0 group-hover/msg:scale-110 transition-transform" />
                              <span className={`text-[11px] font-medium truncate ${conv.status === 'completed' ? 'text-green-400' : 'text-white/60'}`}>
                                {conv.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-white/30 font-bold uppercase">
                                {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <ArrowLeft size={10} className="text-white/20 rotate-180" />
                            </div>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            
            {reservations.length === 0 && (
              <div className="py-12 text-center bg-black/20 rounded-3xl border border-dashed border-white/10">
                <Package size={32} className="mx-auto mb-3 text-white/20" />
                <p className="text-sm text-white/40 font-medium">Waiting for first reservation...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleStartDrop} className="space-y-4">
      <div className="space-y-3">
        <input 
          type="text" 
          placeholder="Drop Title (e.g. Vintage Hoodie)" 
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30"
          required
        />
        <input 
          type="text" 
          placeholder="Price (optional, e.g. 40€)" 
          value={price}
          onChange={e => setPrice(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30"
        />
        <textarea 
          placeholder="Description (optional)" 
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 resize-none h-20"
        />
      </div>

      <div className="space-y-3 pt-2 border-t border-white/10">
        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Options</label>
        
        <input 
          type="text" 
          placeholder="Option Label (e.g. Size, Color, Scent)" 
          value={optionLabel}
          onChange={e => setOptionLabel(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 mb-2"
          required
        />

        <div className="space-y-2">
          {optionInputs.map((opt, index) => (
            <div key={index} className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Value (e.g. S, Gold, 38)" 
                value={opt.value}
                onChange={e => {
                  const newInputs = [...optionInputs];
                  newInputs[index].value = e.target.value;
                  setOptionInputs(newInputs);
                }}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
              />
              <input 
                type="number" 
                min="0"
                placeholder="Stock"
                value={opt.stock}
                onChange={e => {
                  const newInputs = [...optionInputs];
                  newInputs[index].stock = e.target.value;
                  setOptionInputs(newInputs);
                }}
                className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 text-right"
              />
              <button 
                type="button"
                onClick={() => {
                  const newInputs = optionInputs.filter((_, i) => i !== index);
                  setOptionInputs(newInputs);
                }}
                className="p-2 text-white/40 hover:text-red-400 transition-colors"
                disabled={optionInputs.length <= 1}
              >
                <XCircle size={20} />
              </button>
            </div>
          ))}
        </div>

        <button 
          type="button"
          onClick={() => setOptionInputs([...optionInputs, { value: '', stock: '' }])}
          className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium py-1"
        >
          <Plus size={16} /> Add Option Value
        </button>
      </div>

      <button 
        type="submit"
        className="w-full bg-indigo-500 text-white font-semibold rounded-xl py-3.5 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 mt-4 cursor-pointer active:scale-95"
      >
        Start Drop
      </button>
    </form>
  );
}
