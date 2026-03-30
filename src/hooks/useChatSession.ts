import { useState, useEffect } from 'react';
import { ChatMessage, SiteType } from '../lib/chatTypes';
import { chatStorage } from '../lib/chatStorage';

export const useChatSession = (siteType: SiteType) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isLeadSent, setIsLeadSent] = useState(false);

  useEffect(() => {
    let sId = chatStorage.getSessionId();
    if (!sId) {
      sId = chatStorage.generateId();
      chatStorage.setSessionId(sId);
    }
    setSessionId(sId);
    setIsLeadSent(chatStorage.getLeadSent());
    chatStorage.setEntryPage(window.location.pathname);
  }, []);

  const addMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const initChat = () => {
    if (messages.length === 0) {
      const text = siteType === 'portfolio' 
        ? "Привіт. Я AI-менеджер. Можу підказати, який формат сайту вам підійде, зорієнтувати по вартості і показати, як працює система."
        : "Привіт. Зараз ви дивитесь демо-сайт. Я можу показати, як така система працює для бізнесу і як вона переводить відвідувача в заявку.";
      
      addMessage({ role: 'assistant', text });
    }
  };

  return {
    messages,
    addMessage,
    isOpen,
    setIsOpen,
    sessionId,
    isLeadSent,
    setIsLeadSent,
    initChat
  };
};
