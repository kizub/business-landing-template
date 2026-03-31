export type SiteType = 'portfolio' | 'demo';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  cta?: {
    label: string;
    visible: boolean;
  };
  showForm?: boolean;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  siteType: SiteType;
  pageUrl: string;
  pageTitle: string;
  timestamp: string;
  source: 'website_chat';
  quickAction: string;
  clientMeta: {
    device: 'desktop' | 'mobile';
  };
}

export interface ChatResponse {
  reply: string;
  intent: string;
  lead_ready: boolean;
  show_form: boolean;
  quick_replies: string[];
  captured_fields: Record<string, any>;
  cta: {
    label: string;
    visible: boolean;
  };
}

export interface LeadPayload {
  sessionId: string;
  name: string;
  phone: string;
  telegram: string;
  comment: string;
}

export interface ChatSessionHook {
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  sessionId: string;
  isLeadSent: boolean;
  setIsLeadSent: (sent: boolean) => void;
  initChat: () => void;
}
