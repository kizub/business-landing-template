import React from 'react';
import { MessageSquare, X } from 'lucide-react';
import ChatWidget from './ChatWidget';
import { useChatSession } from '../../hooks/useChatSession';
import { SiteType } from '../../lib/chatTypes';

interface Props {
  siteType: SiteType;
}

const ChatLauncher: React.FC<Props> = ({ siteType }) => {
  const session = useChatSession(siteType);

  const toggleChat = () => {
    if (!session.isOpen) session.initChat();
    session.setIsOpen(!session.isOpen);
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center z-[9999] hover:scale-110 transition-transform"
        id="chat-launcher"
      >
        {session.isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>

      {session.isOpen && <ChatWidget session={session} siteType={siteType} />}
    </>
  );
};

export default ChatLauncher;
