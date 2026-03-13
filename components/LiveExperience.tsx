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
import { Users, ShoppingBag } from 'lucide-react';
import Chat from './Chat';
import ProductDrawer from './ProductDrawer';
import HostDashboard from './HostDashboard';
import LiveDropCard from '@/modules/live-drops/components/LiveDropCard';
import { Track, VideoPresets } from 'livekit-client';

interface LiveExperienceProps {
  token: string;
  isHost: boolean;
}

function LiveOverlay({ isHost }: { isHost: boolean }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const participants = useParticipants();
  const room = useRoomContext();
  const tracks = useTracks([Track.Source.Camera]);

  // Find the host track
  const hostTrack = tracks.find((t) => t.participant.identity === 'Host') || tracks[0];

  return (
    <>
      {/* Fullscreen Video Background */}
      <div className="fixed inset-0 z-0 bg-black">
        {hostTrack ? (
          <ParticipantTile
            trackRef={hostTrack}
            className="w-full h-full object-cover"
            disableSpeakingIndicator
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50 text-xl font-light">
            Stream startet gleich
          </div>
        )}
      </div>

      {/* UI Overlays */}
      <div className="fixed inset-0 z-[100] pointer-events-none">
        {/* Top Left: LIVE Badge */}
        <div className="absolute top-12 left-4 flex items-center gap-2 bg-black/30 backdrop-blur-xl border border-white/10 rounded-full px-3.5 py-1.5 pointer-events-auto shadow-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          <span className="text-[11px] font-bold tracking-widest text-white uppercase">Live</span>
        </div>

        {/* Top Right: Viewer Counter & Shop Button Stack */}
        <div className="absolute top-12 right-4 flex flex-col items-end gap-3 pointer-events-none">
          {/* Viewer Counter */}
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xl border border-white/10 rounded-full px-3.5 py-1.5 pointer-events-auto shadow-sm">
            <Users size={14} className="text-white/90" />
            <span className="text-[13px] font-bold italic tracking-tight text-white">{participants.length}</span>
          </div>

          {/* Shopping Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full px-4 py-2.5 shadow-2xl shadow-black/50 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all pointer-events-auto flex items-center justify-center gap-2 font-semibold"
          >
            <ShoppingBag size={18} strokeWidth={2.5} />
            <span className="text-[14px]">Shop</span>
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
