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
import { Track } from 'livekit-client';

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
      <div className="fixed inset-0 z-10 pointer-events-none">
        {/* Top Left: LIVE Badge */}
        <div className="absolute top-12 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 pointer-events-auto">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-live" />
          <span className="text-sm font-bold tracking-widest text-white">LIVE</span>
        </div>

        {/* Top Right: Viewer Counter */}
        <div className="absolute top-12 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 pointer-events-auto">
          <Users size={16} className="text-white/80" />
          <span className="text-sm font-medium text-white">{participants.length}</span>
        </div>

        {/* Bottom Left: Chat */}
        <Chat />

        {/* Bottom Right: Shopping Button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="absolute bottom-20 right-4 bg-white text-black rounded-full p-4 shadow-2xl hover:scale-105 transition-transform pointer-events-auto flex items-center justify-center"
        >
          <ShoppingBag size={24} fill="currentColor" />
        </button>

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
      data-lk-theme="default"
      className="h-screen w-full relative bg-black"
    >
      <LiveOverlay isHost={isHost} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
