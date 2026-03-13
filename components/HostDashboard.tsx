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
        className="absolute top-12 right-24 z-50 bg-black/30 backdrop-blur-xl border border-white/10 rounded-full p-2.5 hover:bg-black/40 transition-all shadow-sm"
      >
        <Settings size={20} className="text-white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-4 md:inset-auto md:top-20 md:right-4 md:w-96 z-50 bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Host Dashboard</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              {(['stream', 'products', 'chat', 'stats'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3.5 text-[13px] font-semibold capitalize transition-all ${
                    activeTab === tab ? 'bg-white text-black shadow-sm rounded-t-xl' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar bg-white">
              {activeTab === 'stream' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="font-medium text-gray-900">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${isStreaming ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' : 'bg-gray-200 text-gray-500'}`}>
                      {isStreaming ? 'LIVE' : 'STANDBY'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={toggleCamera}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                        isCameraEnabled ? 'bg-black border-black text-white shadow-md' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {isCameraEnabled ? <Video size={24} className="mb-2" /> : <VideoOff size={24} className="mb-2" />}
                      <span className="text-sm font-medium">Camera</span>
                    </button>
                    <button
                      onClick={toggleMic}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                        isMicrophoneEnabled ? 'bg-black border-black text-white shadow-md' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {isMicrophoneEnabled ? <Mic size={24} className="mb-2" /> : <MicOff size={24} className="mb-2" />}
                      <span className="text-sm font-medium">Mic</span>
                    </button>
                  </div>

                  {isStreaming ? (
                    <button
                      onClick={handleStopStream}
                      className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 py-4 rounded-2xl font-bold transition-colors shadow-sm"
                    >
                      <Square size={20} fill="currentColor" />
                      Stop Stream
                    </button>
                  ) : (
                    <button
                      onClick={handleGoLive}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 py-4 rounded-2xl font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98]"
                    >
                      <Play size={20} fill="currentColor" />
                      Go Live
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-4 text-center text-gray-400 py-8">
                  <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium text-gray-900">Product pinning coming soon.</p>
                  <p className="text-sm">Manage your Shopify inventory here.</p>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="space-y-4 text-center text-gray-400 py-8">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium text-gray-900">Chat moderation coming soon.</p>
                  <p className="text-sm">View and moderate live chat messages.</p>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100"><Users size={20} className="text-gray-600" /></div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Viewers</p>
                      <p className="text-xl font-bold text-gray-900">{participants.length}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100"><MessageSquare size={20} className="text-gray-600" /></div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Chat Messages</p>
                      <p className="text-xl font-bold text-gray-900">--</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100"><Clock size={20} className="text-gray-600" /></div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Stream Duration</p>
                      <p className="text-xl font-bold text-gray-900">{isStreaming ? 'Live' : '00:00:00'}</p>
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
