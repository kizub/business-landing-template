import React from 'react';
import { Sparkles, X } from 'lucide-react';
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
      <div className="fixed bottom-6 right-6 flex items-center gap-4 z-[9999]">
        <div className="relative group">
          {/* Hover Reveal Text */}
          {!session.isOpen && (
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 hidden md:block opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-blue-500/20">
              Запитай AI прямо зараз
            </div>
          )}

          <button
            onClick={toggleChat}
            className={`relative w-[60px] h-[60px] md:w-[68px] md:h-[68px] bg-slate-950 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-[1.06] hover:shadow-[0_0_35px_rgba(37,99,235,0.8)] border border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.5)] overflow-hidden group-hover:[animation:none] ${!session.isOpen ? 'animate-ai-pulse animate-ai-attention' : ''}`}
            id="chat-launcher"
            aria-label={session.isOpen ? "Закрити чат" : "Відкрити AI чат"}
          >
            {/* Neon Ring: Spinning absolute span */}
            {!session.isOpen && (
              <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400/60 border-l-cyan-400/30 animate-spin-slow pointer-events-none group-hover:[animation:none]" />
            )}

            {/* AI Core Internal Glow/Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-cyan-500/10 rounded-full blur-lg pointer-events-none" />
            <div className="absolute inset-[15%] bg-blue-500/5 rounded-full border border-blue-500/10 pointer-events-none" />

            <div className="relative flex items-center justify-center z-10">
              {session.isOpen ? (
                <X size={30} className="transition-transform duration-300" />
              ) : (
                <Sparkles size={34} className="transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              )}
              
              {/* AI Badge */}
              {!session.isOpen && (
                <div className="absolute -top-5 -right-5 bg-blue-600 text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-slate-950 shadow-[0_0_10px_rgba(37,99,235,0.6)] transition-transform duration-300 group-hover:scale-110 select-none z-20 uppercase tracking-tighter">
                  AI
                </div>
              )}

              {/* Online Status Dot */}
              {!session.isOpen && (
                <span className="absolute -bottom-1 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] z-20 animate-pulse" />
              )}
            </div>
          </button>
        </div>
      </div>

      {session.isOpen && <ChatWidget session={session} siteType={siteType} />}
    </>
  );
};

export default ChatLauncher;
