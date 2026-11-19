import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CalendarDays,
  Edit3,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { getPaymentMethodLabel, TranslationStrings } from '../i18n/translations';
import { AppSettings, Category, Transaction, TransactionType } from '../types/hisab';
import {
  calculateFinancialSummary,
  formatMoney,
  getCategoryLabel,
} from '../utils/calculations';
import { CategoryIcon } from './CategoryIcon';

interface DashboardViewProps {
  transactions: Transaction[];
  categories: Category[];
  settings: AppSettings;
  t: TranslationStrings;
  onQuickAdd: (type: TransactionType) => void;
  onViewHistory: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onUpdateOpeningBalance: (amount: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  categories,
  settings,
  t,
  onQuickAdd,
  onViewHistory,
  onEditTransaction,
  onUpdateOpeningBalance,
}) => {
  const [editingOpening, setEditingOpening] = useState(false);
  const [openingInput, setOpeningInput] = useState(String(settings.openingBalance));
  const [openingError, setOpeningError] = useState('');

  const summary = calculateFinancialSummary(transactions, settings.openingBalance);
  const catMap = new Map(categories.map((c) => [c.id, c]));

  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    .slice(0, 6);

  const handleSaveOpening = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(openingInput);
    if (openingInput.trim() === '' || Number.isNaN(parsed) || parsed < 0) {
      setOpeningError(t.invalidAmountError);
      return;
    }
    onUpdateOpeningBalance(Math.round(parsed * 100) / 100);
    setOpeningError('');
    setEditingOpening(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Row: Available Balance (Blue) + Income (Green) + Expenses (Red) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Available Balance Primary Card (Blue) */}
        <div className="lg:col-span-6 rounded-3xl bg-blue-700 dark:bg-blue-800 text-white p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-100 text-sm font-medium">
                <Wallet className="w-4 h-4" />
                <span>{t.availableBalance}</span>
              </div>
              <p className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight tabular-nums">
                {formatMoney(summary.availableBalance, settings.currency)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpeningInput(String(settings.openingBalance));
                setEditingOpening(true);
              }}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-medium text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t.openingBalance}</span>
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-100">
            <span className="tabular-nums">
              {t.openingBalance}: {formatMoney(summary.openingBalance, settings.currency)}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onQuickAdd('expense')}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white text-red-700 font-semibold text-xs flex items-center gap-1.5 hover:bg-red-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.quickAddExpense}</span>
              </button>
              <button
                type="button"
                onClick={() => onQuickAdd('income')}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.quickAddIncome}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Income & Expense Summary Cards */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          {/* Total Income (Green) */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t.totalIncome}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {formatMoney(summary.totalIncome, settings.currency)}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t.income}</span>
            </div>
          </div>

          {/* Total Expenses (Red) */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t.totalExpenses}
              </span>
              <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 tabular-nums">
              {formatMoney(summary.totalExpenses, settings.currency)}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{t.expense}</span>
            </div>
          </div>

          {/* Today's Expenses */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
                {t.todayExpenses}
              </p>
              <p className="mt-1.5 text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                {formatMoney(summary.todayExpenses, settings.currency)}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          {/* This Month's Expenses */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
                {t.monthExpenses}
              </p>
              <p className="mt-1.5 text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                {formatMoney(summary.monthExpenses, settings.currency)}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {t.recentTransactions}
          </h2>
          {transactions.length > 0 && (
            <button
              type="button"
              onClick={onViewHistory}
              className="min-h-[40px] px-3 text-sm font-semibold text-blue-700 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.viewAll}
            </button>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-10 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {t.noTransactionsTitle}
            </h3>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.noTransactionsDesc}
            </p>
            <button
              type="button"
              onClick={() => onQuickAdd('expense')}
              className="mt-5 h-11 px-5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addFirstTransaction}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map((tx) => {
              const cat = catMap.get(tx.categoryId);
              const isIncome = tx.type === 'income';
              return (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => onEditTransaction(tx)}
                  className="w-full py-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-2 -mx-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat?.color || '#64748B'}18`,
                        color: cat?.color || '#64748B',
                      }}
                    >
                      <CategoryIcon name={cat?.icon || 'Tag'} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {getCategoryLabel(cat, settings.language)}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                        <span className="tabular-nums">{tx.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>{getPaymentMethodLabel(tx.paymentMethod, t)}</span>
                        {tx.notes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{tx.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm sm:text-base font-bold tabular-nums ${
                        isIncome
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatMoney(tx.amount, settings.currency)}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {isIncome ? t.income : t.expense}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Edit Opening Balance Modal */}
      {editingOpening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <form
            noValidate
            onSubmit={handleSaveOpening}
            className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.openingBalance}</h3>
            <div className="mt-4">
              <input
                type="number"
                step="0.01"
                min="0"
                value={openingInput}
                onChange={(e) => {
                  setOpeningInput(e.target.value);
                  setOpeningError('');
                }}
                autoFocus
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg font-bold tabular-nums text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {openingError && (
                <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">
                  {openingError}
                </p>
              )}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setEditingOpening(false)}
                className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-blue-700 hover:bg-blue-800 text-sm font-semibold text-white cursor-pointer"
              >
                {t.save}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
