import { NextResponse } from 'next/server';
import { messagingDb } from '@/modules/reservation-messaging/server/db';
import { db } from '@/modules/live-drops/server/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  const role = url.searchParams.get('role'); // 'host' or 'viewer'

  if (!userId || !role) {
    return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
  }

  let userConversations = [];
  if (role === 'host') {
    userConversations = messagingDb.conversations.filter(c => c.host_id === userId);
  } else {
    userConversations = messagingDb.conversations.filter(c => c.viewer_id === userId);
  }

  // Enrich with drop title and last message
  const enrichedConversations = userConversations.map(conv => {
    const drop = db.drops.find(d => d.id === conv.drop_id);
    const messages = messagingDb.messages.filter(m => m.conversation_id === conv.id);
    const lastMessage = messages.sort((a, b) => b.created_at - a.created_at)[0];

    return {
      ...conv,
      drop_title: drop?.title || 'Unknown Drop',
      last_message: lastMessage ? lastMessage.message_text : '',
      last_message_type: lastMessage ? lastMessage.message_type : 'system',
    };
  });

  // Sort by last message time
  enrichedConversations.sort((a, b) => b.last_message_at - a.last_message_at);

  return NextResponse.json({ conversations: enrichedConversations });
}

export async function PATCH(req: Request) {
  const { conversationId, userId, status } = await req.json();

  if (!conversationId || !userId || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const conversation = messagingDb.conversations.find(c => c.id === conversationId);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  // Only host can update status
  if (conversation.host_id !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const validStatuses = ['contacted', 'in progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  conversation.status = status as any;

  return NextResponse.json({ success: true, conversation });
}
