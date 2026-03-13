import { NextResponse } from 'next/server';
import { messagingDb, Message } from '@/modules/reservation-messaging/server/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const conversationId = url.searchParams.get('conversationId');
  const userId = url.searchParams.get('userId');

  if (!conversationId || !userId) {
    return NextResponse.json({ error: 'Missing conversationId or userId' }, { status: 400 });
  }

  const conversation = messagingDb.conversations.find(c => c.id === conversationId);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  // Check permissions
  if (conversation.host_id !== userId && conversation.viewer_id !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const messages = messagingDb.messages.filter(m => m.conversation_id === conversationId);
  messages.sort((a, b) => a.created_at - b.created_at);

  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const { conversationId, userId, messageText } = await req.json();

  if (!conversationId || !userId || !messageText) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const conversation = messagingDb.conversations.find(c => c.id === conversationId);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  // Check permissions
  if (conversation.host_id !== userId && conversation.viewer_id !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const newMessage: Message = {
    id: Date.now().toString() + Math.random().toString(36).substring(7),
    conversation_id: conversationId,
    sender_id: userId,
    message_text: messageText,
    message_type: 'user',
    created_at: Date.now(),
  };

  messagingDb.messages.push(newMessage);
  conversation.last_message_at = newMessage.created_at;

  return NextResponse.json({ success: true, message: newMessage });
}
