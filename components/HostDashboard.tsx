'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, Video, Mic, VideoOff, MicOff, Play, Square, Users, MessageSquare, Clock, ShoppingBag } from 'lucide-react';
import { useLocalParticipant, useRoomContext, useParticipants } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';

export default function HostDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stream' | 'products' | 'chat' | 'stats'>('stream');
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
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4 z-50 bg-black/40 backdrop-blur-xl border border-white/20 rounded-full p-3 hover:bg-white/20 transition-all shadow-2xl"
      >
        <Settings size={24} className="text-white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-4 md:inset-auto md:top-20 md:right-4 md:w-96 z-50 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold">Host Dashboard</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {(['stream', 'products', 'chat', 'stats'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
              {activeTab === 'stream' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                    <span className="font-medium">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${isStreaming ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse' : 'bg-white/10 text-white/50'}`}>
                      {isStreaming ? 'LIVE' : 'STANDBY'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={toggleCamera}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                        isCameraEnabled ? 'bg-white/20 border-white/30 text-white' : 'bg-black/40 border-white/10 text-white/50'
                      }`}
                    >
                      {isCameraEnabled ? <Video size={24} className="mb-2" /> : <VideoOff size={24} className="mb-2" />}
                      <span className="text-sm font-medium">Camera</span>
                    </button>
                    <button
                      onClick={toggleMic}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                        isMicrophoneEnabled ? 'bg-white/20 border-white/30 text-white' : 'bg-black/40 border-white/10 text-white/50'
                      }`}
                    >
                      {isMicrophoneEnabled ? <Mic size={24} className="mb-2" /> : <MicOff size={24} className="mb-2" />}
                      <span className="text-sm font-medium">Mic</span>
                    </button>
                  </div>

                  {isStreaming ? (
                    <button
                      onClick={handleStopStream}
                      className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 py-4 rounded-2xl font-bold transition-colors"
                    >
                      <Square size={20} fill="currentColor" />
                      Stop Stream
                    </button>
                  ) : (
                    <button
                      onClick={handleGoLive}
                      className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 py-4 rounded-2xl font-bold transition-colors"
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
                  <p>Product pinning coming soon.</p>
                  <p className="text-sm">Manage your Shopify inventory here.</p>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="space-y-4 text-center text-white/50 py-8">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Chat moderation coming soon.</p>
                  <p className="text-sm">View and moderate live chat messages.</p>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-xl"><Users size={20} /></div>
                    <div>
                      <p className="text-sm text-white/50">Viewers</p>
                      <p className="text-xl font-bold">{participants.length}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-xl"><MessageSquare size={20} /></div>
                    <div>
                      <p className="text-sm text-white/50">Chat Messages</p>
                      <p className="text-xl font-bold">--</p>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-xl"><Clock size={20} /></div>
                    <div>
                      <p className="text-sm text-white/50">Stream Duration</p>
                      <p className="text-xl font-bold">{isStreaming ? 'Live' : '00:00:00'}</p>
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
