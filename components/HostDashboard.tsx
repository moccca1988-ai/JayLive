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
  const [activeTab, setActiveTab] = useState<'stream' | 'products' | 'drops' | 'messages' | 'chat' | 'stats' | 'camera'>('stream');
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  const room = useRoomContext();
  const participants = useParticipants();
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraQuality, setCameraQuality] = useState<'auto' | '720p' | '1080p' | '4k'>('auto');
  const [mirrorPreview, setMirrorPreview] = useState(true);
  const [lowLightOpt, setLowLightOpt] = useState(false);

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="absolute inset-4 md:inset-auto md:top-20 md:right-4 md:w-[420px] md:max-h-[85vh] z-[130] glass-card flex flex-col overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-7 border-b border-white/5">
              <h2 className="text-xl font-black text-white tracking-tight">Host Dashboard</h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all text-white/40 hover:text-white cursor-pointer active:scale-90"
                aria-label="Close dashboard"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 bg-black/20 overflow-x-auto no-scrollbar px-4">
              {(['stream', 'products', 'drops', 'messages', 'chat', 'stats', 'camera'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-none px-4 py-4 text-[12px] font-black uppercase tracking-[0.1em] transition-all cursor-pointer relative ${
                    activeTab === tab ? 'text-white' : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-[#7C6CFF] to-[#5EEAD4] rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-7 overflow-y-auto no-scrollbar bg-transparent">
              {activeTab === 'stream' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/5 shadow-inner">
                    <span className="text-xs font-black uppercase tracking-widest text-white/40">Status</span>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${isStreaming ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20 animate-pulse' : 'bg-white/5 text-white/30 border border-white/5'}`}>
                      {isStreaming ? 'LIVE' : 'STANDBY'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={toggleCamera}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${
                        isCameraEnabled ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                      }`}
                    >
                      {isCameraEnabled ? <Video size={24} className="mb-3" /> : <VideoOff size={24} className="mb-3" />}
                      <span className="text-xs font-black uppercase tracking-widest">Camera</span>
                    </button>
                    <button
                      onClick={toggleMic}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${
                        isMicrophoneEnabled ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                      }`}
                    >
                      {isMicrophoneEnabled ? <Mic size={24} className="mb-3" /> : <MicOff size={24} className="mb-3" />}
                      <span className="text-xs font-black uppercase tracking-widest">Mic</span>
                    </button>
                  </div>

                  {isStreaming ? (
                    <button
                      onClick={handleStopStream}
                      className="w-full flex items-center justify-center gap-3 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/20 py-5 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98]"
                    >
                      <Square size={20} fill="currentColor" />
                      Stop Stream
                    </button>
                  ) : (
                    <button
                      onClick={handleGoLive}
                      className="w-full btn-primary flex items-center justify-center gap-3 py-5 text-white font-black uppercase tracking-widest active:scale-[0.98]"
                    >
                      <Play size={20} fill="currentColor" />
                      Go Live
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'camera' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-white/40">Resolution</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['auto', '720p', '1080p'] as const).map((q) => (
                        <button
                          key={q}
                          onClick={() => setCameraQuality(q)}
                          className={`py-3 rounded-xl border font-black uppercase tracking-widest text-[10px] transition-all ${
                            cameraQuality === q ? 'bg-white text-black' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-black uppercase tracking-widest text-white/40">Mirror Preview</span>
                      <input type="checkbox" checked={mirrorPreview} onChange={() => setMirrorPreview(!mirrorPreview)} className="toggle" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-black uppercase tracking-widest text-white/40">Low Light Optimization</span>
                      <input type="checkbox" checked={lowLightOpt} onChange={() => setLowLightOpt(!lowLightOpt)} className="toggle" />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-4 text-center py-12">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                    <ShoppingBag size={32} className="text-white/20" />
                  </div>
                  <p className="font-black text-white tracking-tight">Product pinning coming soon</p>
                  <p className="text-sm text-white/30 font-medium">Manage your Shopify inventory here.</p>
                </div>
              )}

              {activeTab === 'drops' && (
                <HostDropManager onViewMessages={() => setActiveTab('messages')} />
              )}

              {activeTab === 'messages' && (
                <ReservationMessages role="host" />
              )}

              {activeTab === 'chat' && (
                <div className="space-y-4 text-center py-12">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                    <MessageSquare size={32} className="text-white/20" />
                  </div>
                  <p className="font-black text-white tracking-tight">Chat moderation coming soon</p>
                  <p className="text-sm text-white/30 font-medium">View and moderate live chat messages.</p>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-4">
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-center gap-5 shadow-inner">
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5"><Users size={20} className="text-[#5EEAD4]" /></div>
                    <div>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Viewers</p>
                      <p className="text-2xl font-black text-white tracking-tight">{participants.length}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-center gap-5 shadow-inner">
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5"><MessageSquare size={20} className="text-[#7C6CFF]" /></div>
                    <div>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Stream Quality</p>
                      <p className="text-2xl font-black text-white tracking-tight">Excellent</p>
                    </div>
                  </div>
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-center gap-5 shadow-inner">
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5"><Clock size={20} className="text-[#F59E0B]" /></div>
                    <div>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Duration</p>
                      <p className="text-2xl font-black text-white tracking-tight">{isStreaming ? 'Live' : '00:00:00'}</p>
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
