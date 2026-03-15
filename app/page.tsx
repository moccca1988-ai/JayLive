'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

const LiveExperience = dynamic(() => import('@/components/LiveExperience'), {
  ssr: false,
});

export default function Home() {
  const [participantName, setParticipantName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHostLogin, setShowHostLogin] = useState(false);
  const [hostPassword, setHostPassword] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/livekit-token?participantName=${encodeURIComponent(participantName)}&isHost=false`);
      if (!res.ok) throw new Error('Failed to get token');
      const data = await res.json();
      setToken(data.token);
      setIsHost(false);
    } catch (err) {
      setError('Verbindung fehlgeschlagen. Bitte erneut versuchen.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHostLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hostPassword !== 'jayjaym2026') {
      setError('Falsches Passwort');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/livekit-token?participantName=Host&isHost=true`);
      if (!res.ok) throw new Error('Failed to get token');
      const data = await res.json();
      setToken(data.token);
      setIsHost(true);
    } catch (err) {
      setError('Stream konnte nicht gestartet werden.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return <LiveExperience token={token} isHost={isHost} />;
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Soft Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-blue-900/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] bg-indigo-900/20 rounded-full blur-3xl opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 w-full max-w-sm flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-white/10 text-white rounded-[24px] flex items-center justify-center mb-8 shadow-xl shadow-black/20 backdrop-blur-md border border-white/10">
          <ShoppingBag size={36} strokeWidth={1.5} />
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-center mb-3 text-white">
          Jay Jaym Live
        </h1>
        <p className="text-gray-400 text-center mb-10 text-[17px] leading-relaxed">
          Entdecke exklusive Fashion<br/>im interaktiven Livestream.
        </p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-red-500/10 text-red-400 text-[15px] font-medium p-4 rounded-2xl mb-6 text-center border border-red-500/20"
          >
            {error}
          </motion.div>
        )}

        <div className="w-full bg-[#141414] p-6 rounded-[32px] shadow-2xl border border-white/5">
          {!showHostLogin ? (
            <form onSubmit={handleJoin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider ml-1">Dein Name</label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Wie dürfen wir dich nennen?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[17px] text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all placeholder:text-gray-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !participantName.trim()}
                className="w-full bg-white text-black font-medium rounded-2xl py-4 text-[17px] hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-white/10"
              >
                {loading ? 'Verbinde...' : 'Stream beitreten'}
                {!loading && <ArrowRight size={20} />}
              </button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowHostLogin(true)}
                  className="text-gray-500 text-[15px] font-medium hover:text-white transition-colors"
                >
                  Als Host anmelden
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleHostLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider ml-1">Host Passwort</label>
                <input
                  type="password"
                  value={hostPassword}
                  onChange={(e) => setHostPassword(e.target.value)}
                  placeholder="Passwort eingeben"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[17px] text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all placeholder:text-gray-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !hostPassword.trim()}
                className="w-full bg-indigo-500 text-white font-medium rounded-2xl py-4 text-[17px] hover:bg-indigo-600 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {loading ? 'Verbinde...' : 'Live gehen'}
                {!loading && <ArrowRight size={20} />}
              </button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowHostLogin(false)}
                  className="text-gray-500 text-[15px] font-medium hover:text-white transition-colors"
                >
                  Zurück als Zuschauer
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </main>
  );
}
