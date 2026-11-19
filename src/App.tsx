/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BarChart3, History, Home, Plus, Settings } from 'lucide-react';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { InstallAppModal } from './components/InstallAppModal';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { TransactionFormView } from './components/TransactionFormView';
import { DEFAULT_CATEGORIES } from './data/defaultCategories';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { usePWAInstall } from './hooks/usePWAInstall';
import { TRANSLATIONS } from './i18n/translations';
import {
  ActiveTab,
  AppSettings,
  BackupPayload,
  Category,
  Transaction,
  TransactionType,
} from './types/hisab';
import {
  DEFAULT_SETTINGS,
  loadAllLocalData,
  saveCategories,
  saveSettings,
  saveTransactions,
} from './utils/storage';

export default function App() {
  const [hydrated, setHydrated] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [addInitialType, setAddInitialType] = useState<TransactionType>('expense');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.gu;

  // Hydrate offline local storage
  useEffect(() => {
    void loadAllLocalData().then((loaded) => {
      setTransactions(loaded.transactions);
      setCategories(loaded.categories);
      setSettings(loaded.settings);
      setHydrated(true);
    });
  }, []);

  // Sync Tailwind dark mode class & document lang
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.lang = settings.language;
  }, [settings.theme, settings.language]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const handleUpdateSettings = (next: AppSettings) => {
    setSettings(next);
    void saveSettings(next);
  };

  const handleOpenInstall = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) setShowInstallModal(true);
    } else {
      setShowInstallModal(true);
    }
  };

  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    const now = Date.now();
    let updated: Transaction[];
    if (existingId) {
      updated = transactions.map((tx) =>
        tx.id === existingId ? { ...tx, ...txData, updatedAt: now } : tx
      );
      showToast(t.transactionUpdated);
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx_${now}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };
      updated = [newTx, ...transactions];
      showToast(t.transactionSaved);
    }
    setTransactions(updated);
    void saveTransactions(updated);
    setEditingTx(null);
    setActiveTab('home');
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((tx) => tx.id !== id);
    setTransactions(updated);
    void saveTransactions(updated);
    showToast(t.transactionDeleted);
  };

  const handleUpsertCategory = (cat: Category) => {
    const exists = categories.some((c) => c.id === cat.id);
    const updated = exists
      ? categories.map((c) => (c.id === cat.id ? cat : c))
      : [...categories, cat];
    setCategories(updated);
    void saveCategories(updated);
  };

  const handleDeleteCategory = (id: string) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return;
    const sameTypeCount = categories.filter((c) => c.type === target.type).length;
    if (sameTypeCount <= 1) {
      showToast(t.keepAtLeastOneCategory);
      return;
    }
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    void saveCategories(updated);
    showToast(t.categoryDeleted);
  };

  const handleRestoreBackup = (payload: BackupPayload) => {
    setTransactions(payload.transactions);
    setCategories(payload.categories.length > 0 ? payload.categories : DEFAULT_CATEGORIES);
    setSettings(payload.settings);
    void saveTransactions(payload.transactions);
    void saveCategories(payload.categories.length > 0 ? payload.categories : DEFAULT_CATEGORIES);
    void saveSettings(payload.settings);
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-sm font-medium text-slate-500">
        {t.appName}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 md:pb-10">
      {/* Top Bar: 3-zone contract on desktop, compact 52px bar on mobile */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Title */}
          <button
            type="button"
            onClick={() => {
              setEditingTx(null);
              setActiveTab('home');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.appName}
          </button>

          {/* Zone 2: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {(
              [
                ['home', t.navHome],
                ['history', t.navHistory],
                ['reports', t.navReports],
                ['settings', t.navSettings],
              ] as [ActiveTab, string][]
            ).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setEditingTx(null);
                  setActiveTab(tab);
                }}
                className={`py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === tab
                    ? 'border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400 font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setEditingTx(null);
                setAddInitialType('expense');
                setActiveTab('add');
              }}
              className="hidden md:inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addTransactionTitle}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
        {activeTab === 'home' && (
          <DashboardView
            transactions={transactions}
            categories={categories}
            settings={settings}
            t={t}
            onQuickAdd={(type) => {
              setEditingTx(null);
              setAddInitialType(type);
              setActiveTab('add');
            }}
            onViewHistory={() => setActiveTab('history')}
            onEditTransaction={(tx) => {
              setEditingTx(tx);
              setActiveTab('add');
            }}
            onUpdateOpeningBalance={(amount) => {
              handleUpdateSettings({ ...settings, openingBalance: amount });
              showToast(`${t.openingBalance}: ${amount}`);
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            transactions={transactions}
            categories={categories}
            settings={settings}
            t={t}
            onEdit={(tx) => {
              setEditingTx(tx);
              setActiveTab('add');
            }}
            onDelete={handleDeleteTransaction}
          />
        )}

        {activeTab === 'add' && (
          <TransactionFormView
            categories={categories}
            settings={settings}
            t={t}
            initialType={addInitialType}
            editingTransaction={editingTx}
            onSave={handleSaveTransaction}
            onUpsertCategory={handleUpsertCategory}
            onDeleteCategory={handleDeleteCategory}
            onCancel={() => {
              setEditingTx(null);
              setActiveTab('home');
            }}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            transactions={transactions}
            categories={categories}
            settings={settings}
            t={t}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            categories={categories}
            transactions={transactions}
            t={t}
            isInstalled={isInstalled}
            onOpenInstall={() => void handleOpenInstall()}
            onUpdateSettings={handleUpdateSettings}
            onUpsertCategory={handleUpsertCategory}
            onDeleteCategory={handleDeleteCategory}
            onRestoreBackup={handleRestoreBackup}
            onNotify={showToast}
          />
        )}
      </main>

      {/* Mobile Fixed 5-Tab Bottom Navigation Bar with Prominent Center Add Transaction CTA */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe"
      >
        <div className="grid grid-cols-5 items-center h-16 px-1">
          <button
            type="button"
            onClick={() => {
              setEditingTx(null);
              setActiveTab('home');
            }}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              activeTab === 'home'
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">
              {t.navHome}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingTx(null);
              setActiveTab('history');
            }}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              activeTab === 'history'
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">
              {t.navHistory}
            </span>
          </button>

          {/* Prominent Center Add Transaction CTA */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setEditingTx(null);
                setAddInitialType('expense');
                setActiveTab('add');
              }}
              aria-label={t.addTransactionTitle}
              className="w-12 h-12 -mt-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white shadow-md shadow-blue-700/25 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingTx(null);
              setActiveTab('reports');
            }}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              activeTab === 'reports'
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">
              {t.navReports}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingTx(null);
              setActiveTab('settings');
            }}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">
              {t.navSettings}
            </span>
          </button>
        </div>
      </nav>

      {/* Non-intrusive Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-sm z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium text-center md:text-left">
          {toastMsg}
        </div>
      )}

      {/* Offline Connectivity Banner */}
      {!isOnline && (
        <div className="fixed bottom-20 md:bottom-6 left-4 z-40 px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-medium shadow-md">
          {t.offlineReady}
        </div>
      )}

      {/* Install App Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        isInstallable={isInstallable}
        isIOS={isIOS}
        t={t}
        onInstallPrompt={install}
        onClose={() => setShowInstallModal(false)}
        onNotify={showToast}
      />
    </div>
  );
}
