const KEYS = {
  SESSION_ID: 'chat_session_id',
  LEAD_SENT: 'chat_lead_sent',
  ENTRY_PAGE: 'chat_entry_page',
};

export const chatStorage = {
  getSessionId: () => localStorage.getItem(KEYS.SESSION_ID),
  setSessionId: (id: string) => localStorage.setItem(KEYS.SESSION_ID, id),
  
  getLeadSent: () => localStorage.getItem(KEYS.LEAD_SENT) === 'true',
  setLeadSent: (sent: boolean) => localStorage.setItem(KEYS.LEAD_SENT, String(sent)),
  
  getEntryPage: () => localStorage.getItem(KEYS.ENTRY_PAGE),
  setEntryPage: (page: string) => {
    if (!localStorage.getItem(KEYS.ENTRY_PAGE)) {
      localStorage.setItem(KEYS.ENTRY_PAGE, page);
    }
  },

  generateId: () => `sess_${Math.random().toString(36).substring(2, 15)}`,
};
