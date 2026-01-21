
import { Product, User, Order, ChatMessage } from "../types";
import { MOCK_PRODUCTS } from "../constants";

// تحسين نظام التشفير ليكون متوافقاً مع كافة المتصفحات
const encrypt = (data: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(data)));
  } catch (e) {
    return data;
  }
};

const decrypt = (data: string): string => {
  try {
    return decodeURIComponent(escape(atob(data)));
  } catch (e) {
    return data;
  }
};

const DB_KEYS = {
  PRODUCTS: 'sama_store_products',
  ORDERS: 'sama_store_orders',
  CHATS: 'sama_store_chats',
  LOGS: 'sama_store_logs'
};

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  type: 'security' | 'operation' | 'auth';
  status: 'success' | 'warning' | 'error';
}

class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {
    this.init();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private init() {
    if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
      this.saveProducts(MOCK_PRODUCTS);
    }
  }

  private save(key: string, data: any) {
    localStorage.setItem(key, encrypt(JSON.stringify(data)));
  }

  private load(key: string): any {
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      return JSON.parse(decrypt(data));
    } catch (e) {
      return null;
    }
  }

  public getProducts(): Product[] {
    return this.load(DB_KEYS.PRODUCTS) || MOCK_PRODUCTS;
  }

  public saveProducts(p: Product[]) {
    this.save(DB_KEYS.PRODUCTS, p);
  }

  public getOrders(): Order[] {
    return this.load(DB_KEYS.ORDERS) || [];
  }

  public saveOrders(o: Order[]) {
    this.save(DB_KEYS.ORDERS, o);
  }

  public getChats(): ChatMessage[] {
    return this.load(DB_KEYS.CHATS) || [];
  }

  public saveChats(c: ChatMessage[]) {
    this.save(DB_KEYS.CHATS, c);
  }

  public log(action: string, user: string = 'System', type: AuditLog['type'] = 'operation', status: AuditLog['status'] = 'success') {
    const logs = this.load(DB_KEYS.LOGS) || [];
    logs.unshift({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      user, action, type, status
    });
    this.save(DB_KEYS.LOGS, logs.slice(0, 100));
  }

  public getLogs(): AuditLog[] {
    return this.load(DB_KEYS.LOGS) || [];
  }

  // Fix: Added resetDatabase method to clear local storage and reload app
  public resetDatabase() {
    localStorage.removeItem(DB_KEYS.PRODUCTS);
    localStorage.removeItem(DB_KEYS.ORDERS);
    localStorage.removeItem(DB_KEYS.CHATS);
    localStorage.removeItem(DB_KEYS.LOGS);
    window.location.reload();
  }
}

export const db = DatabaseService.getInstance();
