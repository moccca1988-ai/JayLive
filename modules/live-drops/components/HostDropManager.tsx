'use client';

import { useState, useEffect } from 'react';
import { Drop, DropOption, DropReservation } from '@/modules/live-drops/server/db';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function HostDropManager() {
  const [drop, setDrop] = useState<Drop | null>(null);
  const [options, setOptions] = useState<DropOption[]>([]);
  const [reservations, setReservations] = useState<DropReservation[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchDrop = async () => {
    try {
      const res = await fetch('/api/live-drops/host');
      const data = await res.json();
      setDrop(data.drop);
      setOptions(data.options || []);
      setReservations(data.reservations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrop();
    const interval = setInterval(fetchDrop, 3000); // Poll for updates
    return () => clearInterval(interval);
  }, []);

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
      await fetch('/api/live-drops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'END' })
      });
      fetchDrop();
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

  if (loading) return <div className="text-white/50 p-4">Loading...</div>;

  if (drop) {
    const totalStock = options.reduce((acc, s) => acc + s.stock, 0);
    const totalReserved = options.reduce((acc, s) => acc + s.reserved, 0);
    const displayLabel = options.length > 0 ? options[0].option_label : 'Option';

    return (
      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">{drop.title}</h3>
              <p className="text-sm text-white/50">{drop.status}</p>
            </div>
            <button 
              onClick={handleEndDrop}
              className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors cursor-pointer active:scale-95"
            >
              End Drop
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
              <p className="text-xs text-white/50 mb-1">Total Stock</p>
              <p className="text-xl font-bold text-white">{totalStock}</p>
            </div>
            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
              <p className="text-xs text-white/50 mb-1">Total Reserved</p>
              <p className="text-xl font-bold text-white">{totalReserved}</p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <h4 className="text-sm font-semibold text-white/70">Breakdown per {displayLabel.toLowerCase()}:</h4>
            {options.map(s => (
              <div key={s.id} className="flex justify-between items-center text-sm">
                <span className="text-white font-medium">{s.option_value}</span>
                <span className="text-white/70">{s.reserved} / {s.stock} reserved</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white/70">Reservations:</h4>
            {options.map(s => {
              const optionReservations = reservations.filter(r => r.option_value === s.option_value).sort((a, b) => a.position - b.position);
              if (optionReservations.length === 0) return null;
              
              return (
                <div key={s.id} className="space-y-2">
                  <h5 className="text-xs font-bold text-white/50 uppercase tracking-wider">{displayLabel} {s.option_value}</h5>
                  {optionReservations.map(r => (
                    <div key={r.id} className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                      <div>
                        <p className="text-sm font-medium text-white">{r.position}. {r.user_id}</p>
                        <p className="text-xs text-white/40">{new Date(r.created_at).toLocaleTimeString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleContacted(r.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer active:scale-95 ${r.contacted ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/40 hover:text-white'}`}
                          title="Mark as contacted"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          onClick={() => removeReservation(r.id)}
                          className="p-1.5 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer active:scale-95"
                          title="Remove reservation"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
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
