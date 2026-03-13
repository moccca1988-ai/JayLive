'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, Video, Mic, VideoOff, MicOff, Play, Square, Users, MessageSquare, Clock, ShoppingBag, Package } from 'lucide-react';
import { useLocalParticipant, useRoomContext, useParticipants } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import HostDropManager from '@/modules/live-drops/components/HostDropManager';
import ReservationMessages from '@/modules/reservation-messaging/components/ReservationMessages';

export default function HostDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stream' | 'products' | 'drops' | 'messages' | 'chat' | 'stats'>('stream');
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  const room = useRoomContext();
  const participants = useParticipants();
  const [isStreaming, setIsStreaming] = useState(false);

  const toggleCamera = async () => {
    if (isCameraEnabled) {
      await localParticipant.setCameraEnabled(false);
    } else {
      await localParticipant.setCameraEnabled(true);
    }
  };

  const toggleMic = async () => {
    if (isMicrophoneEnabled) {
      await localParticipant.setMicrophoneEnabled(false);
    } else {
      await localParticipant.setMicrophoneEnabled(true);
    }
  };

  const handleGoLive = async () => {
    try {
      if (!isCameraEnabled) await localParticipant.setCameraEnabled(true);
      if (!isMicrophoneEnabled) await localParticipant.setMicrophoneEnabled(true);
      setIsStreaming(true);
      // In a real app, you might signal the backend to start recording or notify users
    } catch (e) {
      console.error('Failed to go live', e);
    }
  };

  const handleStopStream = async () => {
    try {
      await localParticipant.setCameraEnabled(false);
      await localParticipant.setMicrophoneEnabled(false);
      setIsStreaming(false);
    } catch (e) {
      console.error('Failed to stop stream', e);
    }
  };

  return (
    <>
      <div className="absolute top-12 right-24 z-[120] pointer-events-auto">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-full p-2.5 hover:bg-black/40 transition-all shadow-sm"
        >
          <Settings size={20} className="text-white" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-4 md:inset-auto md:top-20 md:right-4 md:w-96 z-[130] bg-[#141414] rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-white/10 pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white tracking-tight">Host Dashboard</h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white cursor-pointer active:scale-95"
                aria-label="Close dashboard"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-[#0A0A0A] overflow-x-auto no-scrollbar">
              {(['stream', 'products', 'drops', 'messages', 'chat', 'stats'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-none px-4 py-4 text-[13px] font-semibold capitalize transition-all cursor-pointer active:scale-95 ${
                    activeTab === tab ? 'bg-[#141414] text-white shadow-sm rounded-t-xl border-t border-x border-white/10' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar bg-[#141414]">
              {activeTab === 'stream' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                    <span className="font-medium text-white">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${isStreaming ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-white/10 text-white/50'}`}>
                      {isStreaming ? 'LIVE' : 'STANDBY'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={toggleCamera}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                        isCameraEnabled ? 'bg-white border-white text-black shadow-md' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {isCameraEnabled ? <Video size={24} className="mb-2" /> : <VideoOff size={24} className="mb-2" />}
                      <span className="text-sm font-medium">Camera</span>
                    </button>
                    <button
                      onClick={toggleMic}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                        isMicrophoneEnabled ? 'bg-white border-white text-black shadow-md' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {isMicrophoneEnabled ? <Mic size={24} className="mb-2" /> : <MicOff size={24} className="mb-2" />}
                      <span className="text-sm font-medium">Mic</span>
                    </button>
                  </div>

                  {isStreaming ? (
                    <button
                      onClick={handleStopStream}
                      className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-4 rounded-2xl font-bold transition-colors shadow-sm"
                    >
                      <Square size={20} fill="currentColor" />
                      Stop Stream
                    </button>
                  ) : (
                    <button
                      onClick={handleGoLive}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-500 text-white hover:bg-indigo-600 py-4 rounded-2xl font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98]"
                    >
                      <Play size={20} fill="currentColor" />
                      Go Live
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-4 text-center text-white/50 py-8">
                  <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium text-white">Product pinning coming soon.</p>
                  <p className="text-sm">Manage your Shopify inventory here.</p>
                </div>
              )}

              {activeTab === 'drops' && (
                <HostDropManager />
              )}

              {activeTab === 'messages' && (
                <ReservationMessages role="host" />
              )}

              {activeTab === 'chat' && (
                <div className="space-y-4 text-center text-white/50 py-8">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium text-white">Chat moderation coming soon.</p>
                  <p className="text-sm">View and moderate live chat messages.</p>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-xl shadow-sm border border-white/5"><Users size={20} className="text-white/80" /></div>
                    <div>
                      <p className="text-sm text-white/50 font-medium">Viewers</p>
                      <p className="text-xl font-bold text-white">{participants.length}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-xl shadow-sm border border-white/5"><MessageSquare size={20} className="text-white/80" /></div>
                    <div>
                      <p className="text-sm text-white/50 font-medium">Chat Messages</p>
                      <p className="text-xl font-bold text-white">--</p>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-xl shadow-sm border border-white/5"><Clock size={20} className="text-white/80" /></div>
                    <div>
                      <p className="text-sm text-white/50 font-medium">Stream Duration</p>
                      <p className="text-xl font-bold text-white">{isStreaming ? 'Live' : '00:00:00'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
