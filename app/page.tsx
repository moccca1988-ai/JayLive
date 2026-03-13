'use client';

import { useState } from 'react';
import LiveExperience from '@/components/LiveExperience';
import { motion } from 'motion/react';
import { ShoppingBag } from 'lucide-react';

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
      setError('Could not join the stream. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHostLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hostPassword !== 'jayjaym2026') {
      setError('Invalid password');
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
      setError('Could not start the stream. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return <LiveExperience token={token} isHost={isHost} />;
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="z-10 w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex justify-center mb-8">
          <div className="bg-white text-black p-4 rounded-full">
            <ShoppingBag size={32} />
          </div>
        </div>

        <h1 className="text-4xl font-light tracking-tight text-center mb-2">Jay Jaym Live</h1>
        <p className="text-white/50 text-center mb-8 font-light">Premium Fashion Live Shopping</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        {!showHostLogin ? (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Wie heißt du?"
                className="w-full bg-black/40 border border-white/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-white/50 transition-colors placeholder:text-white/30"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !participantName.trim()}
              className="w-full bg-white text-black font-semibold rounded-2xl py-4 text-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verbinde...' : 'Beitreten'}
            </button>
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setShowHostLogin(true)}
                className="text-white/40 text-sm hover:text-white transition-colors"
              >
                Host Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleHostLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={hostPassword}
                onChange={(e) => setHostPassword(e.target.value)}
                placeholder="Passwort"
                className="w-full bg-black/40 border border-white/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-white/50 transition-colors placeholder:text-white/30"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !hostPassword.trim()}
              className="w-full bg-white text-black font-semibold rounded-2xl py-4 text-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verbinde...' : 'Als Host starten'}
            </button>
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setShowHostLogin(false)}
                className="text-white/40 text-sm hover:text-white transition-colors"
              >
                Zurück
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </main>
  );
}
