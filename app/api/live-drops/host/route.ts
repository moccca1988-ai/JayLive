import { NextResponse } from 'next/server';
import { db } from '@/modules/live-drops/server/db';
import { messagingDb } from '@/modules/reservation-messaging/server/db';

export async function GET(req: Request) {
  const activeDrop = db.drops.find(d => d.status !== 'ENDED');
  if (!activeDrop) {
    return NextResponse.json({ drop: null });
  }

  const options = db.drop_options.filter(s => s.drop_id === activeDrop.id);
  const reservations = db.drop_reservations.filter(r => r.drop_id === activeDrop.id);
  const conversations = messagingDb.conversations.filter(c => c.drop_id === activeDrop.id);

  return NextResponse.json({
    drop: activeDrop,
    options,
    reservations,
    conversations
  });
}
