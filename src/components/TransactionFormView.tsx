import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Check, Plus, Trash2, X } from 'lucide-react';
import { getPaymentMethodLabel, TranslationStrings } from '../i18n/translations';
import {
  AppSettings,
  Category,
  PaymentMethod,
  Transaction,
  TransactionType,
} from '../types/hisab';
import { getCategoryLabel, getCurrencySymbol, getTodayISO } from '../utils/calculations';
import { CategoryIcon } from './CategoryIcon';

const QUICK_CAT_COLORS = [
  '#EF4444',
  '#F97316',
  '#16A34A',
  '#0D9488',
  '#1D4ED8',
  '#7C3AED',
  '#EC4899',
];

interface TransactionFormViewProps {
  categories: Category[];
  settings: AppSettings;
  t: TranslationStrings;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => void;
  onUpsertCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  onCancel: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'cash',
  'upi',
  'bank_transfer',
  'debit_card',
  'credit_card',
  'other',
];

export const TransactionFormView: React.FC<TransactionFormViewProps> = ({
  categories,
  settings,
  t,
  initialType = 'expense',
  editingTransaction,
  onSave,
  onUpsertCategory,
  onDeleteCategory,
  onCancel,
}) => {
  const [type, setType] = useState<TransactionType>(editingTransaction?.type || initialType);
  const [amount, setAmount] = useState(
    editingTransaction ? String(editingTransaction.amount) : ''
  );
  const [categoryId, setCategoryId] = useState(editingTransaction?.categoryId || '');
  const [date, setDate] = useState(editingTransaction?.date || getTodayISO());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    editingTransaction?.paymentMethod || 'cash'
  );
  const [notes, setNotes] = useState(editingTransaction?.notes || '');
  const [error, setError] = useState('');

  const [showQuickAddCat, setShowQuickAddCat] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [quickCatColor, setQuickCatColor] = useState('#1D4ED8');
  const [quickCatError, setQuickCatError] = useState('');
  const [deleteCatMode, setDeleteCatMode] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCategoryId(editingTransaction.categoryId);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes || '');
      setError('');
    } else {
      setType(initialType);
      setAmount('');
      setDate(getTodayISO());
      setPaymentMethod('cash');
      setNotes('');
      setError('');
    }
  }, [editingTransaction, initialType]);

  useEffect(() => {
    const valid = filteredCategories.some((c) => c.id === categoryId);
    if (!valid) {
      setCategoryId(filteredCategories[0]?.id || '');
    }
  }, [type, categories, categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(t.invalidAmountError);
      return;
    }

    if (!categoryId) {
      setError(t.selectCategoryError);
      return;
    }

    onSave(
      {
        type,
        amount: Math.round(parsedAmount * 100) / 100,
        categoryId,
        date: date || getTodayISO(),
        paymentMethod,
        notes: notes.trim(),
      },
      editingTransaction?.id
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {editingTransaction ? t.editTransactionTitle : t.addTransactionTitle}
          </h1>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[40px] px-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            {t.cancel}
          </button>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Transaction Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              {t.transactionType}
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`min-h-[46px] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>{t.expense}</span>
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`min-h-[46px] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  type === 'income'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>{t.income}</span>
              </button>
            </div>
          </div>

          {/* 2. Amount Input */}
          <div>
            <label
              htmlFor="tx-amount"
              className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2"
            >
              {t.amount} ({getCurrencySymbol(settings.currency)})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                {getCurrencySymbol(settings.currency)}
              </span>
              <input
                id="tx-amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder={t.amountPlaceholder}
                autoFocus={!editingTransaction}
                className="w-full h-16 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-3xl font-bold tabular-nums text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* 3. Category Grid with Add & Delete Options */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t.category}
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteCatMode(false);
                    setShowQuickAddCat((v) => !v);
                    setQuickCatError('');
                  }}
                  className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    showQuickAddCat
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addCategoryShort}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickAddCat(false);
                    setDeleteCatMode((v) => !v);
                  }}
                  className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    deleteCatMode
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50'
                  }`}
                >
                  {deleteCatMode ? <X className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>{deleteCatMode ? t.close : t.removeCategoryShort}</span>
                </button>
              </div>
            </div>

            {showQuickAddCat && (
              <div className="mb-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={quickCatName}
                    onChange={(e) => {
                      setQuickCatName(e.target.value);
                      setQuickCatError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmed = quickCatName.trim();
                        if (!trimmed) {
                          setQuickCatError(t.selectCategoryError);
                          return;
                        }
                        const id = `custom_${Date.now()}`;
                        onUpsertCategory({
                          id,
                          key: id,
                          nameEn: trimmed,
                          nameGu: trimmed,
                          nameHi: trimmed,
                          type,
                          icon: 'Tag',
                          color: quickCatColor,
                          isDefault: false,
                        });
                        setCategoryId(id);
                        setQuickCatName('');
                        setShowQuickAddCat(false);
                      }
                    }}
                    placeholder={t.quickCategoryNamePlaceholder}
                    className="flex-1 h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = quickCatName.trim();
                      if (!trimmed) {
                        setQuickCatError(t.selectCategoryError);
                        return;
                      }
                      const id = `custom_${Date.now()}`;
                      onUpsertCategory({
                        id,
                        key: id,
                        nameEn: trimmed,
                        nameGu: trimmed,
                        nameHi: trimmed,
                        type,
                        icon: 'Tag',
                        color: quickCatColor,
                        isDefault: false,
                      });
                      setCategoryId(id);
                      setQuickCatName('');
                      setShowQuickAddCat(false);
                    }}
                    className="h-10 px-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    {t.save}
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_CAT_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setQuickCatColor(col)}
                        className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                        style={{ backgroundColor: col }}
                      >
                        {quickCatColor === col && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickAddCat(false);
                      setQuickCatError('');
                    }}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                </div>
                {quickCatError && (
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {quickCatError}
                  </p>
                )}
              </div>
            )}

            {deleteCatMode && (
              <p className="mb-2.5 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-xs font-medium text-red-700 dark:text-red-300">
                {t.deleteCategoryModeHint}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {filteredCategories.map((cat) => {
                const selected = cat.id === categoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      if (deleteCatMode) {
                        onDeleteCategory(cat.id);
                        return;
                      }
                      setCategoryId(cat.id);
                      setError('');
                    }}
                    className={`min-h-[52px] p-2.5 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      deleteCatMode
                        ? 'border-red-300 dark:border-red-800 bg-red-50/60 dark:bg-red-950/20 text-slate-800 dark:text-slate-100 hover:bg-red-100 dark:hover:bg-red-950/50'
                        : selected
                          ? 'border-blue-700 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-500 text-blue-900 dark:text-blue-100'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat.color}1A`, color: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-semibold leading-snug line-clamp-2">
                        {getCategoryLabel(cat, settings.language)}
                      </span>
                    </div>
                    {deleteCatMode && (
                      <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4 & 5. Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="tx-date"
                className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2"
              >
                {t.date}
              </label>
              <input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium tabular-nums text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="tx-pm"
                className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2"
              >
                {t.paymentMethod}
              </label>
              <select
                id="tx-pm"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full h-12 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {getPaymentMethodLabel(pm, t)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6. Notes */}
          <div>
            <label
              htmlFor="tx-notes"
              className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2"
            >
              {t.notes}
            </label>
            <input
              id="tx-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notesPlaceholder}
              maxLength={140}
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          {/* Large SAVE TRANSACTION Button */}
          <button
            type="submit"
            className={`w-full h-14 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-700 hover:bg-emerald-800'
                : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            <Check className="w-5 h-5" />
            <span>{editingTransaction ? t.updateTransaction : t.saveTransaction}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
