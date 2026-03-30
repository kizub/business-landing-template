import { ChatRequest, ChatResponse, LeadPayload, SiteType } from '../lib/chatTypes';

export const useChatApi = () => {
  const sendMessage = async (
    sessionId: string, 
    text: string, 
    siteType: SiteType,
    quickAction: string = ""
  ): Promise<ChatResponse> => {
    const payload: ChatRequest = {
      sessionId,
      message: text,
      siteType,
      pageUrl: window.location.pathname,
      pageTitle: document.title,
      timestamp: new Date().toISOString(),
      source: 'website_chat',
      quickAction,
      clientMeta: {
        device: window.innerWidth < 768 ? 'mobile' : 'desktop'
      }
    };

    const response = await fetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  };

  const sendLead = async (payload: LeadPayload): Promise<{ ok: boolean }> => {
    const response = await fetch('/api/chat/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  };

  return { sendMessage, sendLead };
};
