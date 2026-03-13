'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Drop, DropOption, DropReservation, ReservationStatus } from '@/modules/live-drops/server/db';
import { Conversation } from '@/modules/reservation-messaging/server/db';
import { Plus, Trash2, CheckCircle, XCircle, MessageSquare, ArrowLeft, Package, ShoppingBag, Clock, User, Tag, ChevronRight, Filter, MoreVertical } from 'lucide-react';

export default function HostDropManager({ onViewMessages }: { onViewMessages?: () => void }) {
  const [drop, setDrop] = useState<Drop | null>(null);
  const [options, setOptions] = useState<DropOption[]>([]);
  const [reservations, setReservations] = useState<DropReservation[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEndedSummary, setShowEndedSummary] = useState(false);
  const [lastEndedDrop, setLastEndedDrop] = useState<{ drop: Drop, options: DropOption[], reservations: DropReservation[] } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

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

  const updateReservationStatus = async (reservationId: string, status: ReservationStatus) => {
    try {
      await fetch('/api/live-drops/host/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_STATUS', reservationId, status })
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
    const sellThrough = totalStock > 0 ? Math.round((totalReserved / totalStock) * 100) : 0;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="w-20 h-20 bg-green-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-green-500/20 rotate-3">
            <CheckCircle className="text-green-400" size={40} />
          </div>
          
          <h3 className="text-3xl font-black text-white tracking-tight mb-2">Drop Complete</h3>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-8">{d.title}</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
              <p className="text-[10px] text-white/30 mb-2 uppercase font-black tracking-widest">Total Sold</p>
              <p className="text-3xl font-black text-white">{totalReserved}</p>
            </div>
            <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
              <p className="text-[10px] text-white/30 mb-2 uppercase font-black tracking-widest">Sell-Through</p>
              <p className="text-3xl font-black text-indigo-400">{sellThrough}%</p>
            </div>
          </div>

          <div className="space-y-3 mb-10">
            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Final Inventory</h4>
            <div className="space-y-2">
              {opts.map(o => (
                <div key={o.id} className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-2xl border border-white/5">
                  <span className="text-sm font-black text-white/80">{o.option_value}</span>
                  <span className="text-sm font-black text-white">{o.reserved} <span className="text-white/20 font-normal">/ {o.stock}</span></span>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setShowEndedSummary(false)}
            className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-gray-200 transition-all active:scale-95 cursor-pointer shadow-xl shadow-white/10 uppercase tracking-widest text-xs"
          >
            Create Another Drop
          </button>
        </div>
      </div>
    );
  }

  if (drop) {
    const totalStock = options.reduce((acc, s) => acc + s.stock, 0);
    const totalReserved = options.reduce((acc, s) => acc + s.reserved, 0);
    const totalRemaining = totalStock - totalReserved;
    const displayLabel = options.length > 0 ? options[0].option_label : 'Option';

    const filteredReservations = reservations.filter(r => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'unread') {
        const conv = conversations.find(c => c.reservation_id === r.id);
        return conv && conv.status === 'contacted'; // Assuming 'contacted' means unread/new message in this context or we could use another flag
      }
      return r.status === filterStatus;
    });

    return (
      <div className="space-y-6 pb-20">
        {/* SECTION A — Active Drop Header */}
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`flex h-2 w-2 rounded-full ${drop.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{drop.status}</span>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight mb-1">{drop.title}</h3>
              {drop.price && <p className="text-indigo-400 font-bold text-lg">{drop.price}</p>}
              {drop.description && <p className="text-white/50 text-xs mt-2 line-clamp-2">{drop.description}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleEndDrop}
                className="bg-red-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 cursor-pointer active:scale-95"
              >
                End Drop
              </button>
              <button 
                onClick={onViewMessages}
                className="bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white/20 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} />
                Messages
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
              <p className="text-[9px] text-white/30 mb-1 uppercase font-black tracking-widest">Stock</p>
              <p className="text-xl font-black text-white">{totalStock}</p>
            </div>
            <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
              <p className="text-[9px] text-white/30 mb-1 uppercase font-black tracking-widest">Reserved</p>
              <p className="text-xl font-black text-white">{totalReserved}</p>
            </div>
            <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
              <p className="text-[9px] text-white/30 mb-1 uppercase font-black tracking-widest">Left</p>
              <p className="text-xl font-black text-indigo-400">{totalRemaining}</p>
            </div>
          </div>
        </div>

        {/* SECTION B — Inventory by Option */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Inventory: {displayLabel}</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {options.map(s => {
              const remaining = s.stock - s.reserved;
              const isSoldOut = remaining <= 0;
              return (
                <div key={s.id} className={`p-4 rounded-2xl border transition-all ${isSoldOut ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-black ${isSoldOut ? 'text-red-400' : 'text-white'}`}>{s.option_value}</span>
                    {isSoldOut && <span className="text-[8px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">Sold Out</span>}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-white/30 font-bold uppercase mb-0.5">Reserved</p>
                      <p className="text-lg font-black text-white">{s.reserved}<span className="text-white/20 text-xs font-normal">/{s.stock}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-white/30 font-bold uppercase mb-0.5">Left</p>
                      <p className={`text-lg font-black ${remaining < 3 && !isSoldOut ? 'text-orange-400' : isSoldOut ? 'text-red-400' : 'text-indigo-400'}`}>{remaining}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${isSoldOut ? 'bg-red-500' : 'bg-indigo-500'}`}
                      style={{ width: `${(s.reserved / s.stock) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION C — Live Reservations List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Live Reservations</h4>
            <div className="flex gap-2">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white/60 font-bold uppercase focus:outline-none focus:border-white/30 cursor-pointer"
              >
                <option value="all">All</option>
                <option value="waiting">Waiting</option>
                <option value="contacted">Contacted</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredReservations.length > 0 ? (
              filteredReservations.sort((a, b) => a.position - b.position).map(r => {
                const conv = conversations.find(c => c.reservation_id === r.id);
                const option = options.find(o => o.id === r.option_id);
                
                return (
                  <div key={r.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group transition-all hover:bg-white/[0.07]">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 font-black text-sm border border-indigo-500/20">
                            #{r.position}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-white">{r.user_id}</p>
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                                r.status === 'completed' ? 'bg-green-500 text-white' :
                                r.status === 'contacted' ? 'bg-indigo-500 text-white' :
                                r.status === 'in progress' ? 'bg-orange-500 text-white' :
                                'bg-white/10 text-white/60'
                              }`}>
                                {r.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-white/30 font-bold uppercase flex items-center gap-1 mt-0.5">
                              <Tag size={10} /> {displayLabel}: {option?.option_value} • {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <select 
                            value={r.status}
                            onChange={(e) => updateReservationStatus(r.id, e.target.value as ReservationStatus)}
                            className="bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-[10px] text-white/70 font-bold uppercase focus:outline-none focus:border-white/30 cursor-pointer"
                          >
                            <option value="waiting">Waiting</option>
                            <option value="contacted">Contacted</option>
                            <option value="in progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button 
                            onClick={() => removeReservation(r.id)}
                            className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer active:scale-95"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {conv && (
                        <button 
                          onClick={onViewMessages}
                          className="w-full flex items-center justify-between bg-black/20 rounded-xl p-3 hover:bg-black/40 transition-all group/msg"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="relative">
                              <MessageSquare size={16} className="text-indigo-400" />
                              {conv.status === 'contacted' && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border border-black" />
                              )}
                            </div>
                            <div className="text-left overflow-hidden">
                              <p className="text-[11px] font-black text-white/80 group-hover/msg:text-white transition-colors">View Conversation</p>
                              <p className="text-[10px] text-white/40 truncate font-medium">Last active {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-white/20 group-hover/msg:text-white/60 transition-all transform group-hover/msg:translate-x-0.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Package size={40} className="mx-auto mb-4 text-white/10" />
                <p className="text-sm text-white/40 font-black uppercase tracking-widest">No reservations yet</p>
                <p className="text-xs text-white/20 mt-1">Waiting for viewers to join the drop</p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION D — Reservation Messages Preview */}
        {conversations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Recent Messages</h4>
            </div>
            <div className="space-y-2">
              {conversations
                .sort((a, b) => b.last_message_at - a.last_message_at)
                .slice(0, 3)
                .map(conv => {
                  const reservation = reservations.find(r => r.id === conv.reservation_id);
                  return (
                    <button 
                      key={conv.id}
                      onClick={onViewMessages}
                      className="w-full flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.08] transition-all text-left"
                    >
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/40 font-black text-xs flex-shrink-0">
                        {conv.viewer_id.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-black text-white truncate">{conv.viewer_id}</p>
                          <span className="text-[9px] text-white/30 font-bold uppercase">{new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[11px] text-white/50 truncate font-medium">
                          {reservation ? `#${reservation.position} • ${conv.option_selected}` : conv.option_selected}
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
                    </button>
                  );
                })}
              <button 
                onClick={onViewMessages}
                className="w-full py-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
              >
                View All Messages
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h3 className="text-3xl font-black text-white tracking-tight mb-2">Create New Drop</h3>
        <p className="text-white/40 text-sm font-medium">Set up your inventory and start the live reservation event.</p>
      </div>

      <form onSubmit={handleStartDrop} className="space-y-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-1">Drop Details</label>
              <input 
                type="text" 
                placeholder="Drop Title (e.g. Vintage Hoodie)" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-1">Price</label>
                <input 
                  type="text" 
                  placeholder="e.g. 40€" 
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-1">Description</label>
                <input 
                  type="text" 
                  placeholder="Short tagline..." 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-1">Inventory Options</label>
            <input 
              type="text" 
              placeholder="Option Label (e.g. Size, Color, Scent)" 
              value={optionLabel}
              onChange={e => setOptionLabel(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Values & Stock</span>
            </div>
            <div className="space-y-2">
              {optionInputs.map((opt, index) => (
                <div key={index} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                  <input 
                    type="text" 
                    placeholder="Value (e.g. S, Gold, 38)" 
                    value={opt.value}
                    onChange={e => {
                      const newInputs = [...optionInputs];
                      newInputs[index].value = e.target.value;
                      setOptionInputs(newInputs);
                    }}
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20"
                  />
                  <div className="relative w-28">
                    <input 
                      type="number" 
                      min="0"
                      placeholder="Qty"
                      value={opt.stock}
                      onChange={e => {
                        const newInputs = [...optionInputs];
                        newInputs[index].stock = e.target.value;
                        setOptionInputs(newInputs);
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all text-center placeholder:text-white/20"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      const newInputs = optionInputs.filter((_, i) => i !== index);
                      setOptionInputs(newInputs);
                    }}
                    className="p-3 text-white/20 hover:text-red-400 transition-colors disabled:opacity-0"
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
              className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors py-2 px-1"
            >
              <Plus size={14} /> Add Another Value
            </button>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-indigo-500 text-white font-black rounded-2xl py-5 hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-500/30 uppercase tracking-[0.2em] text-xs cursor-pointer active:scale-95"
        >
          Launch Live Drop
        </button>
      </form>
    </div>
  );
}
