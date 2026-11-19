export type Language = 'gu' | 'hi' | 'en';

export type ThemeMode = 'light' | 'dark';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

export type TransactionType = 'income' | 'expense';

export type PaymentMethod =
  | 'cash'
  | 'upi'
  | 'bank_transfer'
  | 'debit_card'
  | 'credit_card'
  | 'other';

export interface Category {
  id: string;
  key: string;
  nameEn: string;
  nameGu: string;
  nameHi: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface PinSecurityState {
  isConfigured: boolean;
  pinLength: 4 | 6;
  salt: string;
  pinHash: string;
  recoveryQuestion: string;
  recoveryAnswerHash: string;
  recoveryKeyHash: string;
  lockOnBackground: boolean;
}

export interface AppSettings {
  language: Language;
  theme: ThemeMode;
  currency: CurrencyCode;
  openingBalance: number;
  lockOnBackground: boolean;
}

export interface BackupPayload {
  version: number;
  app: string;
  exportedAt: string;
  settings: AppSettings;
  categories: Category[];
  transactions: Transaction[];
}

export type ActiveTab = 'home' | 'history' | 'add' | 'reports' | 'settings';
