import React, { useState } from 'react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ChatQuickReplies from './ChatQuickReplies';
import LeadMiniForm from './LeadMiniForm';
import TypingIndicator from './TypingIndicator';
import { useChatApi } from '../../hooks/useChatApi';
import { SiteType, ChatSessionHook } from '../../lib/chatTypes';

interface Props {
  session: ChatSessionHook;
  siteType: SiteType;
}

const ChatWidget: React.FC<Props> = ({ session, siteType }) => {
  const [isTyping, setIsTyping] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const { sendMessage } = useChatApi();

  const handleSend = async (text: string, quickAction: string = "") => {
    if (isTyping) return;

    // If user explicitly wants to leave a lead via quick reply, we can force the form
    const isLeadRequest = quickAction.toLowerCase().includes('заявку') || 
                         quickAction.toLowerCase().includes('контакт') ||
                         text.toLowerCase().includes('залишити заявку');

    session.addMessage({ role: 'user', text });
    setIsTyping(true);

    try {
      const response = await sendMessage(session.sessionId, text, siteType, quickAction);
      setIsTyping(false);

      const assistantMsg = {
        role: 'assistant' as const,
        text: response.reply,
        quickReplies: response.quick_replies,
        cta: response.cta,
        showForm: response.show_form || isLeadRequest
      };

      session.addMessage(assistantMsg);
      
      if (response.show_form || isLeadRequest) {
        setShowLeadForm(true);
      }
    } catch (err) {
      setIsTyping(false);
      session.addMessage({
        role: 'assistant',
        text: "Вибачте, виникла помилка. Спробуйте пізніше."
      });
    }
  };

  const lastMessage = session.messages[session.messages.length - 1];
  const canShowForm = (showLeadForm || lastMessage?.showForm) && !session.isLeadSent;

  return (
    <div className="fixed bottom-24 right-6 w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-[9999] border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 p-4 text-white flex items-center gap-3">
        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-xs font-bold">AI</div>
        <div>
          <div className="text-sm font-bold">AI Менеджер</div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        <ChatMessages messages={session.messages} />
        {isTyping && <TypingIndicator />}

        {!isTyping && lastMessage?.cta?.visible && (
          <button
            onClick={() => {
              setShowLeadForm(true);
              session.addMessage({
                role: 'assistant',
                text: 'Давайте зафіксуємо вашу заявку 👇',
                showForm: true
              });
            }}
            className="w-full py-2 bg-accent text-white rounded-lg text-sm font-bold shadow-sm hover:bg-accent/90 transition-colors"
          >
            {lastMessage.cta.label}
          </button>
        )}

        {!isTyping && canShowForm && (
          <LeadMiniForm session={session} onSuccess={() => setShowLeadForm(false)} />
        )}
      </div>

      <div className="p-2 bg-white border-t border-slate-100">
        {!isTyping && lastMessage?.quickReplies && (
          <ChatQuickReplies
            replies={lastMessage.quickReplies}
            onSelect={(r) => handleSend(r, r)}
          />
        )}
        <ChatInput onSend={(t) => handleSend(t)} disabled={isTyping} />
      </div>
    </div>
  );
};

export default ChatWidget;
