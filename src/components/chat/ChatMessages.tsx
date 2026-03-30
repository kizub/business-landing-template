import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../../lib/chatTypes';

const ChatMessages: React.FC<{ messages: ChatMessage[] }> = ({ messages }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col gap-4">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
            msg.role === 'user' 
              ? 'bg-accent text-white rounded-tr-none' 
              : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-none'
          }`}>
            {msg.text}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};

export default ChatMessages;
