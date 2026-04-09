const KEYS = {
  SESSION_ID: 'chat_session_id',
  LEAD_SENT: 'chat_lead_sent',
  ENTRY_PAGE: 'chat_entry_page',
};

export const chatStorage = {
  getSessionId: () => sessionStorage.getItem(KEYS.SESSION_ID),
  setSessionId: (id: string) => sessionStorage.setItem(KEYS.SESSION_ID, id),
  
  getLeadSent: (sessionId: string) => sessionStorage.getItem(`${KEYS.LEAD_SENT}_${sessionId}`) === 'true',
  setLeadSent: (sessionId: string, sent: boolean) => sessionStorage.setItem(`${KEYS.LEAD_SENT}_${sessionId}`, String(sent)),
  
  getEntryPage: () => sessionStorage.getItem(KEYS.ENTRY_PAGE),
  setEntryPage: (page: string) => {
    if (!sessionStorage.getItem(KEYS.ENTRY_PAGE)) {
      sessionStorage.setItem(KEYS.ENTRY_PAGE, page);
    }
  },

  generateId: () => `sess_${Math.random().toString(36).substring(2, 15)}`,
};
