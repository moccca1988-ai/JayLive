import { NextResponse } from 'next/server';
import { db, DropReservation } from '@/modules/live-drops/server/db';
import { broadcastDropUpdate } from '@/modules/live-drops/server/livekit';
import { messagingDb, Conversation, Message } from '@/modules/reservation-messaging/server/db';

export async function POST(req: Request) {
  const { dropId, userId, optionValue } = await req.json();

  const drop = db.drops.find(d => d.id === dropId);
  if (!drop || drop.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Drop is not active' }, { status: 400 });
  }

  // Check if user already reserved
  const existing = db.drop_reservations.find(r => r.drop_id === dropId && r.user_id === userId);
  if (existing) {
    return NextResponse.json({ error: 'You have already reserved an item in this drop' }, { status: 400 });
  }

  const dropOption = db.drop_options.find(s => s.drop_id === dropId && s.option_value === optionValue);
  if (!dropOption) {
    return NextResponse.json({ error: 'Invalid option' }, { status: 400 });
  }

  if (dropOption.reserved >= dropOption.stock) {
    return NextResponse.json({ error: 'This option is already reserved.' }, { status: 400 });
  }

  // Atomic-ish (Node.js is single-threaded for synchronous code)
  dropOption.reserved += 1;
  const position = dropOption.reserved;

  const reservation: DropReservation = {
    id: Date.now().toString() + Math.random().toString(36).substring(7),
    drop_id: dropId,
    user_id: userId,
    option_id: dropOption.id,
    position,
    created_at: Date.now(),
    contacted: false
  };

  db.drop_reservations.push(reservation);

  // Create conversation
  const conversationId = Date.now().toString() + Math.random().toString(36).substring(7);
  const conversation: Conversation = {
    id: conversationId,
    drop_id: dropId,
    reservation_id: reservation.id,
    host_id: drop.host_id,
    viewer_id: userId,
    option_selected: optionValue,
    reservation_position: position,
    status: 'in progress',
    created_at: Date.now(),
    last_message_at: Date.now(),
  };

  messagingDb.conversations.push(conversation);

  const systemMessage: Message = {
    id: Date.now().toString() + Math.random().toString(36).substring(7),
    conversation_id: conversationId,
    sender_id: 'system',
    message_text: `Reservation confirmed for ${drop.title} – ${dropOption.option_label} ${optionValue} – Position #${position}.\nYou can now communicate directly with the host.`,
    message_type: 'system',
    created_at: Date.now(),
  };

  messagingDb.messages.push(systemMessage);

  // Check if drop is full
  const allOptions = db.drop_options.filter(s => s.drop_id === dropId);
  const isFull = allOptions.every(s => s.reserved >= s.stock);
  if (isFull) {
    drop.status = 'FULL';
  }

  await broadcastDropUpdate();

  return NextResponse.json({ success: true, reservation });
}
