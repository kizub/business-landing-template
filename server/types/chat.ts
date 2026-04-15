export type SiteType = "portfolio" | "demo";

export type ChatIntent = 
  | "pricing" 
  | "features" 
  | "demo" 
  | "packages" 
  | "support" 
  | "lead_ready" 
  | "unknown";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  createdAt: string;
}

export interface ChatSession {
  sessionId: string;
  siteType: SiteType;
  entryPage: string;
  lastPage: string;
  leadCreated: boolean;
  intent: ChatIntent;
  name?: string;
  phone?: string;
  telegram?: string;
  budget?: string;
  serviceInterest?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AssistantResponse {
  reply: string;
  intent: ChatIntent;
  lead_ready: boolean;
  show_form: boolean;
  quick_replies: string[];
  captured_fields: Record<string, any>;
  conversation_stage?: string;
  manager_note?: string;
  user_journey?: string[];
  cta: {
    label: string;
    visible: boolean;
  };
}

export interface ChatMessagePayload {
  sessionId: string;
  message: string;
  siteType: SiteType;
  pageUrl: string;
  pageTitle: string;
  timestamp: string;
  source: "website_chat";
  quickAction: string;
  clientMeta: {
    device: "desktop" | "mobile";
  };
}

export interface LeadPayload {
  sessionId: string;
  name: string;
  phone: string;
  telegram: string;
  comment: string;
}
