import { TokenLog, MessageLog, EmbedFormData, PurchaseLog, User } from './discord-types';

export class LocalStorage {
  // User-specific storage methods
  static getTokenLogs(username?: string): TokenLog[] {
    try {
      const key = username ? `tokenLogs_${username}` : 'tokenLogs';
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  static setTokenLogs(logs: TokenLog[], username?: string): void {
    const key = username ? `tokenLogs_${username}` : 'tokenLogs';
    localStorage.setItem(key, JSON.stringify(logs));
  }

  static addTokenLog(log: TokenLog, username?: string): void {
    const logs = this.getTokenLogs(username);
    logs.push(log);
    this.setTokenLogs(logs, username);
  }

  static getMessageLogs(username?: string): MessageLog[] {
    try {
      const key = username ? `messageLogs_${username}` : 'messageLogs';
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  static setMessageLogs(logs: MessageLog[], username?: string): void {
    const key = username ? `messageLogs_${username}` : 'messageLogs';
    localStorage.setItem(key, JSON.stringify(logs));
  }

  static addMessageLog(log: MessageLog, username?: string): void {
    const logs = this.getMessageLogs(username);
    logs.push(log);
    this.setMessageLogs(logs, username);
  }

  static getEmbedFormData(username?: string): Partial<EmbedFormData> {
    try {
      const key = username ? `embedFormData_${username}` : 'embedFormData';
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      // Never load sensitive data like tokens, always start fresh for security
      const { botToken, channelId, botChannelId, ...safeData } = data;
      return safeData;
    } catch {
      return {};
    }
  }

  static setEmbedFormData(data: Partial<EmbedFormData>, username?: string): void {
    const key = username ? `embedFormData_${username}` : 'embedFormData';
    const current = this.getEmbedFormData(username);
    // Don't save sensitive data like tokens for security
    const { botToken, channelId, botChannelId, ...safeData } = data;
    const updated = { ...current, ...safeData };
    localStorage.setItem(key, JSON.stringify(updated));
  }

  static clearTokenLogs(username?: string): void {
    this.setTokenLogs([], username);
  }

  static clearMessageLogs(username?: string): void {
    this.setMessageLogs([], username);
  }

  // Admin-only methods that can access all users' data
  static getAllTokenLogs(): TokenLog[] {
    const allLogs: TokenLog[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tokenLogs')) {
        try {
          const logs = JSON.parse(localStorage.getItem(key) || '[]');
          allLogs.push(...logs);
        } catch {
          // Skip invalid data
        }
      }
    }
    return allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static getAllMessageLogs(): MessageLog[] {
    const allLogs: MessageLog[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('messageLogs')) {
        try {
          const logs = JSON.parse(localStorage.getItem(key) || '[]');
          allLogs.push(...logs);
        } catch {
          // Skip invalid data
        }
      }
    }
    return allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static exportLogs(): void {
    const data = {
      tokenLogs: this.getTokenLogs(),
      messageLogs: this.getMessageLogs(),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discord-embed-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Purchase logs
  static getPurchaseLogs(): PurchaseLog[] {
    try {
      return JSON.parse(localStorage.getItem('purchaseLogs') || '[]');
    } catch {
      return [];
    }
  }

  static setPurchaseLogs(logs: PurchaseLog[]): void {
    localStorage.setItem('purchaseLogs', JSON.stringify(logs));
  }

  static addPurchaseLog(log: PurchaseLog): void {
    const logs = this.getPurchaseLogs();
    logs.push(log);
    this.setPurchaseLogs(logs);
  }

  // Users management
  static getUsers(): Record<string, User> {
    try {
      const stored = localStorage.getItem('users');
      if (stored) {
        return JSON.parse(stored);
      }
      // Return default users if nothing stored
      return {
        admin: { username: 'admin', password: 'admin123', role: 'admin' },
        user1: { username: 'user1', password: 'user123', role: 'user' }
      };
    } catch {
      return {
        admin: { username: 'admin', password: 'admin123', role: 'admin' },
        user1: { username: 'user1', password: 'user123', role: 'user' }
      };
    }
  }

  static setUsers(users: Record<string, User>): void {
    localStorage.setItem('users', JSON.stringify(users));
  }

  static addUser(username: string, user: User): void {
    const users = this.getUsers();
    users[username] = user;
    this.setUsers(users);
  }
}
