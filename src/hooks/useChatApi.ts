import { ChatRequest, ChatResponse, LeadPayload, SiteType } from '../lib/chatTypes';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

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

    const result = await response.json();

    // Google Ads conversion tracking
    if (result?.ok && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: 'AW-18087000874/QnEpCNdnuJscEKr2xrBD'
      });
    }

    return result;
  };

  return { sendMessage, sendLead };
};
