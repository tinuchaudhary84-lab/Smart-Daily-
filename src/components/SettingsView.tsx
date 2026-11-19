import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Code2,
  Download,
  FileSpreadsheet,
  FileText,
  FolderCog,
  Moon,
  Plus,
  Smartphone,
  Sun,
  Trash2,
  Upload,
  Edit2,
} from 'lucide-react';
import { TranslationStrings } from '../i18n/translations';
import {
  AppSettings,
  BackupPayload,
  Category,
  CurrencyCode,
  Language,
  Transaction,
  TransactionType,
} from '../types/hisab';
import { downloadAndroidStudioProjectZip } from '../utils/androidProjectExporter';
import { getCategoryLabel } from '../utils/calculations';
import {
  exportBackupJSON,
  exportReportPDF,
  exportTransactionsCSV,
  parseAndValidateBackupJSON,
} from '../utils/exportUtils';
import { CategoryIcon } from './CategoryIcon';

interface SettingsViewProps {
  settings: AppSettings;
  categories: Category[];
  transactions: Transaction[];
  t: TranslationStrings;
  isInstalled: boolean;
  onOpenInstall: () => void;
  onUpdateSettings: (next: AppSettings) => void;
  onUpsertCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  onRestoreBackup: (payload: BackupPayload) => void;
  onNotify: (msg: string) => void;
}

const COLOR_SWATCHES = [
  '#EF4444',
  '#F97316',
  '#D97706',
  '#16A34A',
  '#0D9488',
  '#0EA5E9',
  '#1D4ED8',
  '#7C3AED',
  '#EC4899',
  '#64748B',
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  categories,
  transactions,
  t,
  isInstalled,
  onOpenInstall,
  onUpdateSettings,
  onUpsertCategory,
  onDeleteCategory,
  onRestoreBackup,
  onNotify,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [busyExport, setBusyExport] = useState<'pdf' | 'zip' | null>(null);

  // Opening Balance local edit
  const [openingInput, setOpeningInput] = useState(String(settings.openingBalance));

  useEffect(() => {
    setOpeningInput(String(settings.openingBalance));
  }, [settings.openingBalance]);

  // Manage Categories modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catType, setCatType] = useState<TransactionType>('expense');
  const [catNameEn, setCatNameEn] = useState('');
  const [catNameGu, setCatNameGu] = useState('');
  const [catNameHi, setCatNameHi] = useState('');
  const [catColor, setCatColor] = useState('#1D4ED8');
  const [catError, setCatError] = useState('');
  const [confirmDeleteCatId, setConfirmDeleteCatId] = useState<string | null>(null);

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');
    if (!catNameEn.trim() && !catNameGu.trim() && !catNameHi.trim()) {
      setCatError(t.selectCategoryError);
      return;
    }
    const baseName = catNameEn.trim() || catNameGu.trim() || catNameHi.trim();
    const cat: Category = {
      id: editingCat?.id || `custom_${Date.now()}`,
      key: editingCat?.key || `custom_${Date.now()}`,
      nameEn: catNameEn.trim() || baseName,
      nameGu: catNameGu.trim() || baseName,
      nameHi: catNameHi.trim() || baseName,
      type: editingCat ? editingCat.type : catType,
      icon: editingCat?.icon || 'Tag',
      color: catColor,
      isDefault: editingCat?.isDefault || false,
    };
    onUpsertCategory(cat);
    onNotify(editingCat ? t.transactionUpdated : t.saveCategory);
    setEditingCat(null);
    setCatNameEn('');
    setCatNameGu('');
    setCatNameHi('');
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const payload = parseAndValidateBackupJSON(text);
      onRestoreBackup(payload);
      onNotify(t.restoreSuccess);
    } catch {
      onNotify(t.restoreError);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t.settingsTitle}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Language, Currency & Theme */}
        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t.preferencesSection}
          </h2>

          {/* Language Selection */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              {t.languageLabel}
            </p>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {(['gu', 'hi', 'en'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, language: lang })}
                  className={`min-h-[40px] rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                    settings.language === lang
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {lang === 'gu' ? 'ગુજરાતી' : lang === 'hi' ? 'हिन्दी' : 'English'}
                </button>
              ))}
            </div>
          </div>

          {/* Currency & Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                {t.currencyLabel}
              </label>
              <select
                value={settings.currency}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, currency: e.target.value as CurrencyCode })
                }
                className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
              >
                <option value="INR">₹ INR (Indian Rupee)</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
                <option value="AED">د.إ AED</option>
              </select>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                {t.themeLabel}
              </p>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
                  className={`min-h-[38px] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                    settings.theme === 'light'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>{t.lightMode}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                  className={`min-h-[38px] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                    settings.theme === 'dark'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>{t.darkMode}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Categories & Opening Balance */}
        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t.financialSection}
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              {t.openingBalance}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={openingInput}
                onChange={(e) => setOpeningInput(e.target.value)}
                className="flex-1 h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold tabular-nums text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => {
                  const v = parseFloat(openingInput);
                  if (openingInput.trim() === '' || Number.isNaN(v) || v < 0) {
                    onNotify(t.invalidAmountError);
                    return;
                  }
                  const clean = Math.round(v * 100) / 100;
                  onUpdateSettings({ ...settings, openingBalance: clean });
                  onNotify(`${t.openingBalance}: ${clean}`);
                }}
                className="h-11 px-5 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white text-sm font-semibold cursor-pointer transition-all"
              >
                {t.save}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCatModal(true)}
            className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-center gap-2 cursor-pointer"
          >
            <FolderCog className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span>
              {t.manageCategories} ({categories.length})
            </span>
          </button>
        </section>

        {/* 4. Backup, Restore, PDF & CSV Export */}
        <section className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t.backupExportSection}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => {
                try {
                  exportBackupJSON(settings, categories, transactions);
                  onNotify(t.backupData);
                } catch {
                  onNotify(t.restoreError);
                }
              }}
              className="min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>{t.backupData}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>{t.restoreData}</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleRestoreFile}
              className="hidden"
            />

            <button
              type="button"
              disabled={busyExport === 'pdf'}
              onClick={async () => {
                setBusyExport('pdf');
                try {
                  await exportReportPDF(transactions, categories, settings, t);
                  onNotify(t.exportPdf);
                } catch {
                  window.print();
                } finally {
                  setBusyExport(null);
                }
              }}
              className="min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60 text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>{t.exportPdf}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                try {
                  exportTransactionsCSV(transactions, categories, settings.language, t);
                  onNotify(t.exportCsv);
                } catch {
                  onNotify(t.restoreError);
                }
              }}
              className="min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>{t.exportCsv}</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t.backupDesc} · {t.restoreDesc}
          </p>
        </section>
      </div>

      {/* 5. App Info, PWA Install & Android Studio Kotlin Source */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{t.appInfoTitle}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {t.appInfoDesc}
            </p>
            <p className="mt-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              {t.offlineReady}
            </p>
          </div>

          {!isInstalled && (
            <button
              type="button"
              onClick={onOpenInstall}
              className="h-11 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white text-sm font-semibold flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>{t.installApp}</span>
            </button>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Code2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>{t.androidSourceTitle}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              {t.androidSourceDesc}
            </p>
          </div>
          <button
            type="button"
            disabled={busyExport === 'zip'}
            onClick={async () => {
              setBusyExport('zip');
              try {
                await downloadAndroidStudioProjectZip();
                onNotify(t.downloadAndroidZip);
              } catch {
                onNotify(t.restoreError);
              } finally {
                setBusyExport(null);
              }
            }}
            className="h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadAndroidZip}</span>
          </button>
        </div>
      </section>

      {/* Manage Categories Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.manageCategories}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCatModal(false);
                  setEditingCat(null);
                  setConfirmDeleteCatId(null);
                }}
                className="min-h-[40px] px-3 text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                {t.close}
              </button>
            </div>

            <form
              noValidate
              onSubmit={handleSaveCategory}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 space-y-3 mb-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {editingCat ? t.editCategory : t.addCategory}
                </span>
                {editingCat ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCat(null);
                      setCatNameEn('');
                      setCatNameGu('');
                      setCatNameHi('');
                      setCatError('');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                ) : (
                  <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg">
                    {(['expense', 'income'] as TransactionType[]).map((tp) => (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => setCatType(tp)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                          catType === tp
                            ? 'bg-blue-700 text-white'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {tp === 'expense' ? t.expense : t.income}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder={t.categoryNameGu}
                  value={catNameGu}
                  onChange={(e) => {
                    setCatNameGu(e.target.value);
                    setCatError('');
                  }}
                  className="h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder={t.categoryNameHi}
                  value={catNameHi}
                  onChange={(e) => {
                    setCatNameHi(e.target.value);
                    setCatError('');
                  }}
                  className="h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder={t.categoryNameEn}
                  value={catNameEn}
                  onChange={(e) => {
                    setCatNameEn(e.target.value);
                    setCatError('');
                  }}
                  className="h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {catError && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-400">{catError}</p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_SWATCHES.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setCatColor(col)}
                      className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                      style={{ backgroundColor: col }}
                    >
                      {catColor === col && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {editingCat && (
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteCategory(editingCat.id);
                        setEditingCat(null);
                        setCatNameEn('');
                        setCatNameGu('');
                        setCatNameHi('');
                        setCatError('');
                      }}
                      className="h-10 px-3 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.removeCategoryShort}</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.saveCategory}</span>
                  </button>
                </div>
              </div>
            </form>

            <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
              {categories.map((cat) => (
                <div key={cat.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}1A`, color: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {getCategoryLabel(cat, settings.language)}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {cat.type === 'income' ? t.income : t.expense} · {cat.nameEn}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {confirmDeleteCatId === cat.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteCategory(cat.id);
                            setConfirmDeleteCatId(null);
                            if (editingCat?.id === cat.id) {
                              setEditingCat(null);
                              setCatNameEn('');
                              setCatNameGu('');
                              setCatNameHi('');
                            }
                          }}
                          className="h-8 px-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                        >
                          {t.confirmDelete}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteCatId(null)}
                          className="h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          {t.cancel}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDeleteCatId(null);
                            setEditingCat(cat);
                            setCatNameEn(cat.nameEn);
                            setCatNameGu(cat.nameGu);
                            setCatNameHi(cat.nameHi);
                            setCatColor(cat.color);
                            setCatError('');
                          }}
                          aria-label={t.edit}
                          className="min-w-[36px] min-h-[36px] rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center justify-center cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteCatId(cat.id)}
                          className="h-9 px-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t.removeCategoryShort}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
