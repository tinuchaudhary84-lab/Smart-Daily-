import React, { useMemo, useState } from 'react';
import { ArrowDownUp, Edit2, Search, Trash2, Wallet } from 'lucide-react';
import { getPaymentMethodLabel, TranslationStrings } from '../i18n/translations';
import { AppSettings, Category, Transaction } from '../types/hisab';
import { formatMoney, getCategoryLabel, getTodayISO } from '../utils/calculations';
import { CategoryIcon } from './CategoryIcon';

interface HistoryViewProps {
  transactions: Transaction[];
  categories: Category[];
  settings: AppSettings;
  t: TranslationStrings;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

type DateFilterOption = 'all' | 'today' | 'week' | 'month' | 'custom';

export const HistoryView: React.FC<HistoryViewProps> = ({
  transactions,
  categories,
  settings,
  t,
  onEdit,
  onDelete,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const filteredTransactions = useMemo(() => {
    const today = getTodayISO();
    const monthPrefix = today.slice(0, 7);
    const nowDate = new Date();
    const weekAgo = new Date(nowDate.getTime() - 6 * 86400000);
    const weekAgoISO = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`;

    const q = search.trim().toLowerCase();

    return transactions
      .filter((tx) => {
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) return false;

        if (dateFilter === 'today' && tx.date !== today) return false;
        if (dateFilter === 'week' && (tx.date < weekAgoISO || tx.date > today)) return false;
        if (dateFilter === 'month' && !tx.date.startsWith(monthPrefix)) return false;
        if (dateFilter === 'custom') {
          if (customFrom && tx.date < customFrom) return false;
          if (customTo && tx.date > customTo) return false;
        }

        if (q) {
          const cat = catMap.get(tx.categoryId);
          const catLabel = getCategoryLabel(cat, settings.language).toLowerCase();
          const pmLabel = getPaymentMethodLabel(tx.paymentMethod, t).toLowerCase();
          const notes = (tx.notes || '').toLowerCase();
          const amtStr = String(tx.amount);
          if (
            !catLabel.includes(q) &&
            !pmLabel.includes(q) &&
            !notes.includes(q) &&
            !amtStr.includes(q) &&
            !tx.date.includes(q)
          ) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const cmp = a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
        return sortOrder === 'newest' ? -cmp : cmp;
      });
  }, [
    transactions,
    typeFilter,
    categoryFilter,
    dateFilter,
    customFrom,
    customTo,
    search,
    sortOrder,
    catMap,
    settings.language,
    t,
  ]);

  return (
    <div className="space-y-4">
      {/* Header + Filter Controls */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {t.historyTitle}
          </h1>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            {filteredTransactions.length} {t.matchingCount}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Segmented Type Filter + Dropdown Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['all', 'expense', 'income'] as const).map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setTypeFilter(tp)}
                className={`min-h-[38px] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  typeFilter === tp
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {tp === 'all' ? t.filterAll : tp === 'expense' ? t.expense : t.income}
              </button>
            ))}
          </div>

          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label={t.filterCategory}
              className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">{t.allCategories}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {getCategoryLabel(c, settings.language)}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilterOption)}
              aria-label={t.filterDate}
              className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">{t.dateAll}</option>
              <option value="today">{t.dateToday}</option>
              <option value="week">{t.dateThisWeek}</option>
              <option value="month">{t.dateThisMonth}</option>
              <option value="custom">{t.dateCustom}</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
              className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 whitespace-nowrap cursor-pointer"
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              <span>{sortOrder === 'newest' ? t.sortNewest : t.sortOldest}</span>
            </button>
          </div>
        </div>

        {/* Custom Date Range Pickers */}
        {dateFilter === 'custom' && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                {t.fromDate}
              </label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                {t.toDate}
              </label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t.noDataForPeriod}
            </p>
            {(search || typeFilter !== 'all' || categoryFilter !== 'all' || dateFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setTypeFilter('all');
                  setCategoryFilter('all');
                  setDateFilter('all');
                  setCustomFrom('');
                  setCustomTo('');
                }}
                className="mt-4 h-10 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                {t.filterAll}
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map((tx) => {
              const cat = catMap.get(tx.categoryId);
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat?.color || '#64748B'}1A`,
                        color: cat?.color || '#64748B',
                      }}
                    >
                      <CategoryIcon name={cat?.icon || 'Tag'} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {getCategoryLabel(cat, settings.language)}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="tabular-nums">{tx.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>{getPaymentMethodLabel(tx.paymentMethod, t)}</span>
                        {tx.notes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate max-w-[220px]">{tx.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="text-right">
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
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isIncome ? t.income : t.expense}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onEdit(tx)}
                      aria-label={t.edit}
                      className="min-w-[40px] min-h-[40px] rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(tx.id)}
                      aria-label={t.delete}
                      className="min-w-[40px] min-h-[40px] rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 dark:hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.deleteConfirmTitle}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.deleteConfirmMessage}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white cursor-pointer"
              >
                {t.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
