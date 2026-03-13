import { RoomServiceClient } from 'livekit-server-sdk';

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || '';
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';

export const roomService = new RoomServiceClient(
  LIVEKIT_URL,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET
);

export async function broadcastDropUpdate() {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify({ type: 'DROP_UPDATED' }));
    // DataPacket_Kind.RELIABLE = 0
    await roomService.sendData('jayjaym-live-room', data, 0);
  } catch (error) {
    console.error('Failed to broadcast drop update:', error);
  }
}
