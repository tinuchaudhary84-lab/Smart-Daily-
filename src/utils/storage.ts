import { DEFAULT_CATEGORIES } from '../data/defaultCategories';
import { AppSettings, Category, PinSecurityState, Transaction } from '../types/hisab';

const DB_NAME = 'SmartDailyHisabDB';
const DB_VERSION = 1;
const STORE_KV = 'kv_store';

const LS_KEYS = {
  transactions: 'sdh_transactions_v1',
  categories: 'sdh_categories_v1',
  settings: 'sdh_settings_v1',
  security: 'sdh_security_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'gu',
  theme: 'light',
  currency: 'INR',
  openingBalance: 0,
  lockOnBackground: true,
};

export const DEFAULT_SECURITY: PinSecurityState = {
  isConfigured: false,
  pinLength: 4,
  salt: '',
  pinHash: '',
  recoveryQuestion: '',
  recoveryAnswerHash: '',
  recoveryKeyHash: '',
  lockOnBackground: true,
};

function openIDB(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 500);
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_KV)) {
          db.createObjectStore(STORE_KV);
        }
      };
      req.onsuccess = () => {
        clearTimeout(timer);
        resolve(req.result);
      };
      req.onerror = () => {
        clearTimeout(timer);
        resolve(null);
      };
      req.onblocked = () => {
        clearTimeout(timer);
        resolve(null);
      };
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openIDB();
  if (!db) return null;
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 500);
    try {
      const tx = db.transaction(STORE_KV, 'readonly');
      const store = tx.objectStore(STORE_KV);
      const req = store.get(key);
      req.onsuccess = () => {
        clearTimeout(timer);
        resolve((req.result as T) ?? null);
      };
      req.onerror = () => {
        clearTimeout(timer);
        resolve(null);
      };
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors cleanly
  }
  const db = await openIDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_KV, 'readwrite');
      const store = tx.objectStore(STORE_KV);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export interface LoadedAppState {
  transactions: Transaction[];
  categories: Category[];
  settings: AppSettings;
  security: PinSecurityState;
}

export async function loadAllLocalData(): Promise<LoadedAppState> {
  const [idbTx, idbCat, idbSetVal, idbSec] = await Promise.all([
    idbGet<Transaction[]>(LS_KEYS.transactions),
    idbGet<Category[]>(LS_KEYS.categories),
    idbGet<AppSettings>(LS_KEYS.settings),
    idbGet<PinSecurityState>(LS_KEYS.security),
  ]);

  const transactions = idbTx ?? lsGet<Transaction[]>(LS_KEYS.transactions) ?? [];
  const categories = idbCat ?? lsGet<Category[]>(LS_KEYS.categories) ?? DEFAULT_CATEGORIES;
  const settings = {
    ...DEFAULT_SETTINGS,
    ...(idbSetVal ?? lsGet<AppSettings>(LS_KEYS.settings) ?? {}),
  };
  const security = {
    ...DEFAULT_SECURITY,
    ...(idbSec ?? lsGet<PinSecurityState>(LS_KEYS.security) ?? {}),
  };

  return { transactions, categories, settings, security };
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  await idbSet(LS_KEYS.transactions, transactions);
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await idbSet(LS_KEYS.categories, categories);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await idbSet(LS_KEYS.settings, settings);
}

export async function saveSecurityState(security: PinSecurityState): Promise<void> {
  await idbSet(LS_KEYS.security, security);
}
