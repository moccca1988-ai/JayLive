'use client';

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useRoomContext,
  ParticipantTile,
  useTracks,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useEffect, useState } from 'react';
import { Users, ShoppingBag, MessageSquare } from 'lucide-react';
import Chat from './Chat';
import ProductDrawer from './ProductDrawer';
import HostDashboard from './HostDashboard';
import LiveDropCard from '@/modules/live-drops/components/LiveDropCard';
import ViewerMessagesDrawer from '@/modules/reservation-messaging/components/ViewerMessagesDrawer';
import { Track, VideoPresets } from 'livekit-client';

interface LiveExperienceProps {
  token: string;
  isHost: boolean;
}

function LiveOverlay({ isHost }: { isHost: boolean }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera]);

  // Find the host track
  const hostTrack = tracks.find((t) => t.participant.identity === 'Host') || tracks[0];

  return (
    <>
      {/* Fullscreen Video Background */}
      <div className="fixed inset-0 z-0 bg-[#0B0B0F]">
        {hostTrack ? (
          <ParticipantTile
            trackRef={hostTrack}
            className="w-full h-full object-cover"
            disableSpeakingIndicator
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-xl font-medium tracking-tight">
            Waiting for stream...
          </div>
        )}
      </div>

      {/* UI Overlays */}
      <div className="fixed inset-0 z-[100] pointer-events-none">
        {/* Top Left: LIVE Badge */}
        <div className="absolute top-12 left-4 flex items-center gap-2.5 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full px-4 py-2 pointer-events-auto shadow-2xl">
          <div className="w-2 h-2 bg-[#EF4444] rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
          <span className="text-[11px] font-black tracking-[0.2em] text-white uppercase">Live</span>
        </div>

        {/* Top Right: Viewer Counter */}
        <div className="absolute top-12 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full px-4 py-2 pointer-events-auto shadow-2xl">
          <Users size={14} className="text-white/70" />
          <span className="text-[13px] font-black tracking-tight text-white">{participants.length}</span>
        </div>

        {/* Right Side Vertical Stack */}
        <div className="absolute top-28 right-4 flex flex-col gap-3 pointer-events-none">
          {/* Messages Button (Viewer only) */}
          {!isHost && (
            <button
              onClick={() => setIsMessagesOpen(true)}
              className="glass w-12 h-12 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all pointer-events-auto flex items-center justify-center"
              title="Messages"
            >
              <MessageSquare size={20} />
            </button>
          )}

          {/* Shopping Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="btn-primary w-12 h-12 text-white flex items-center justify-center pointer-events-auto"
            title="Shop"
          >
            <ShoppingBag size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Live Drop Card */}
        <LiveDropCard />

        {/* Bottom Left: Chat */}
        <Chat />

        {/* Host Dashboard */}
        {isHost && <HostDashboard />}
      </div>

      {/* Product Drawer */}
      <ProductDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Viewer Messages Drawer */}
      {!isHost && <ViewerMessagesDrawer isOpen={isMessagesOpen} onClose={() => setIsMessagesOpen(false)} />}
    </>
  );
}

export default function LiveExperience({ token, isHost }: LiveExperienceProps) {
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!serverUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>LiveKit URL is missing.</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={isHost}
      audio={isHost}
      token={token}
      serverUrl={serverUrl}
      options={{
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          simulcast: true,
          videoSimulcastLayers: [
            {
              ...VideoPresets.h1080,
              resolution: VideoPresets.h1080.resolution,
              encoding: {
                ...VideoPresets.h1080.encoding,
                maxBitrate: 5000000,
              },
            },
            VideoPresets.h720,
            VideoPresets.h360,
          ],
        },
        videoCaptureDefaults: {
          resolution: {
            width: 1920,
            height: 1080,
            frameRate: 30,
          },
        },
      }}
      data-lk-theme="default"
      className="h-screen w-full relative bg-black"
    >
      <LiveOverlay isHost={isHost} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
