import { ChatSession } from "../../types/chat.js";

class ChatMemoryStore {
  private sessions: Map<string, ChatSession> = new Map();

  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  setSession(sessionId: string, session: ChatSession): void {
    this.sessions.set(sessionId, session);
  }

  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }
}

export const chatMemoryStore = new ChatMemoryStore();
