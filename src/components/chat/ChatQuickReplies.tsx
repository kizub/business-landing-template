import React from 'react';

interface Props {
  replies: string[];
  onSelect: (reply: string) => void;
}

const ChatQuickReplies: React.FC<Props> = ({ replies, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-2 px-2">
      {replies.map((reply, i) => (
        <button
          key={i}
          onClick={() => onSelect(reply)}
          className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium hover:bg-slate-200 transition-colors border border-slate-200"
        >
          {reply}
        </button>
      ))}
    </div>
  );
};

export default ChatQuickReplies;
