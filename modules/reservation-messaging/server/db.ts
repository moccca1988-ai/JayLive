export type ConversationStatus = 'contacted' | 'in progress' | 'completed' | 'cancelled';

export interface Conversation {
  id: string;
  drop_id: string;
  reservation_id: string;
  host_id: string;
  viewer_id: string;
  option_selected: string;
  reservation_position: number;
  status: ConversationStatus;
  created_at: number;
  last_message_at: number;
}

export type MessageType = 'user' | 'system';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string;
  message_type: MessageType;
  created_at: number;
}

const globalForDb = globalThis as unknown as {
  __RESERVATION_MESSAGING_DB: {
    conversations: Conversation[];
    messages: Message[];
  };
};

export const messagingDb = globalForDb.__RESERVATION_MESSAGING_DB || {
  conversations: [],
  messages: [],
};

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__RESERVATION_MESSAGING_DB = messagingDb;
}
