import React, { useState } from 'react';
import { useChatApi } from '../../hooks/useChatApi';
import { chatStorage } from '../../lib/chatStorage';

const LeadMiniForm: React.FC<{ session: any }> = ({ session }) => {
  const [form, setForm] = useState({ name: '', phone: '', telegram: '', comment: '' });
  const [loading, setLoading] = useState(false);
  const { sendLead } = useChatApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone && !form.telegram) {
      alert('Будь ласка, вкажіть телефон або Telegram');
      return;
    }

    setLoading(true);
    try {
      const res = await sendLead({
        sessionId: session.sessionId,
        ...form
      });

      if (res.ok) {
        chatStorage.setLeadSent(true);
        session.setIsLeadSent(true);
        session.addMessage({ 
          role: 'assistant', 
          text: "Дякую! Ваша заявка отримана. Я зв'яжусь з вами найближчим часом." 
        });
      }
    } catch (err) {
      alert('Помилка відправки. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
      <div className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">Залишити контакти</div>
      <input
        type="text"
        placeholder="Ваше ім'я"
        className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-accent"
        value={form.name}
        onChange={e => setForm({...form, name: e.target.value})}
      />
      <input
        type="text"
        placeholder="Телефон"
        className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-accent"
        value={form.phone}
        onChange={e => setForm({...form, phone: e.target.value})}
      />
      <input
        type="text"
        placeholder="Telegram"
        className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-accent"
        value={form.telegram}
        onChange={e => setForm({...form, telegram: e.target.value})}
      />
      <textarea
        placeholder="Коментар"
        className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-accent h-16 resize-none"
        value={form.comment}
        onChange={e => setForm({...form, comment: e.target.value})}
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
      >
        {loading ? 'Відправка...' : 'Відправити заявку'}
      </button>
    </form>
  );
};

export default LeadMiniForm;
