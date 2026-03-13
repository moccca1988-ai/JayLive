import { NextResponse } from 'next/server';
import { db } from '@/modules/live-drops/server/db';
import { broadcastDropUpdate } from '@/modules/live-drops/server/livekit';

export async function POST(req: Request) {
  const { action, reservationId } = await req.json();

  const reservation = db.drop_reservations.find(r => r.id === reservationId);
  if (!reservation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (action === 'TOGGLE_CONTACTED') {
    reservation.contacted = !reservation.contacted;
    await broadcastDropUpdate();
    return NextResponse.json({ success: true });
  }

  if (action === 'REMOVE') {
    // Remove reservation
    db.drop_reservations = db.drop_reservations.filter(r => r.id !== reservationId);
    
    // Decrease reserved count
    const dropOption = db.drop_options.find(s => s.id === reservation.option_id);
    if (dropOption) {
      dropOption.reserved = Math.max(0, dropOption.reserved - 1);
    }

    // If drop was FULL, make it ACTIVE again
    const drop = db.drops.find(d => d.id === reservation.drop_id);
    if (drop && drop.status === 'FULL') {
      drop.status = 'ACTIVE';
    }

    await broadcastDropUpdate();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
