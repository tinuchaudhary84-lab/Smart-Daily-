import { jsPDF } from 'jspdf';
import { getPaymentMethodLabel, TranslationStrings } from '../i18n/translations';
import { AppSettings, BackupPayload, Category, Language, Transaction } from '../types/hisab';
import { calculateFinancialSummary, formatMoney, getCategoryLabel } from './calculations';

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportBackupJSON(
  settings: AppSettings,
  categories: Category[],
  transactions: Transaction[]
): void {
  const payload: BackupPayload = {
    version: 1,
    app: 'Smart Daily Hisab',
    exportedAt: new Date().toISOString(),
    settings,
    categories,
    transactions,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const datePart = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `smart-daily-hisab-backup-${datePart}.json`);
}

export function parseAndValidateBackupJSON(rawText: string): BackupPayload {
  const parsed = JSON.parse(rawText) as Partial<BackupPayload>;
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !Array.isArray(parsed.transactions) ||
    !Array.isArray(parsed.categories) ||
    !parsed.settings
  ) {
    throw new Error('Invalid backup structure');
  }

  // Sanitize and validate every transaction
  const validTransactions: Transaction[] = parsed.transactions
    .filter(
      (tx): tx is Transaction =>
        Boolean(tx) &&
        typeof tx.id === 'string' &&
        (tx.type === 'income' || tx.type === 'expense') &&
        typeof tx.amount === 'number' &&
        Number.isFinite(tx.amount) &&
        tx.amount > 0 &&
        typeof tx.categoryId === 'string' &&
        typeof tx.date === 'string'
    )
    .map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      categoryId: tx.categoryId,
      date: tx.date,
      paymentMethod: tx.paymentMethod || 'cash',
      notes: typeof tx.notes === 'string' ? tx.notes : '',
      createdAt: typeof tx.createdAt === 'number' ? tx.createdAt : Date.now(),
      updatedAt: typeof tx.updatedAt === 'number' ? tx.updatedAt : Date.now(),
    }));

  const validCategories: Category[] = parsed.categories.filter(
    (c): c is Category =>
      Boolean(c) &&
      typeof c.id === 'string' &&
      typeof c.nameEn === 'string' &&
      (c.type === 'income' || c.type === 'expense')
  );

  return {
    version: Number(parsed.version) || 1,
    app: 'Smart Daily Hisab',
    exportedAt: parsed.exportedAt || new Date().toISOString(),
    settings: {
      language: parsed.settings.language || 'gu',
      theme: parsed.settings.theme === 'dark' ? 'dark' : 'light',
      currency: parsed.settings.currency || 'INR',
      openingBalance: Number(parsed.settings.openingBalance) || 0,
      lockOnBackground: parsed.settings.lockOnBackground !== false,
    },
    categories: validCategories,
    transactions: validTransactions,
  };
}

function escapeCSV(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function exportTransactionsCSV(
  transactions: Transaction[],
  categories: Category[],
  lang: Language,
  t: TranslationStrings
): void {
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const headers = [
    t.date,
    t.transactionType,
    t.category,
    t.amount,
    t.paymentMethod,
    t.notes,
  ];
  const rows = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    .map((tx) => [
      tx.date,
      tx.type === 'income' ? t.income : t.expense,
      getCategoryLabel(catMap.get(tx.categoryId), lang),
      String(tx.amount),
      getPaymentMethodLabel(tx.paymentMethod, t),
      tx.notes || '',
    ]);

  const csvLines = [
    headers.map(escapeCSV).join(','),
    ...rows.map((r) => r.map(escapeCSV).join(',')),
  ].join('\n');

  // Prepend UTF-8 BOM so Gujarati & Hindi Unicode display cleanly in Excel
  const blob = new Blob(['\uFEFF' + csvLines], { type: 'text/csv;charset=utf-8;' });
  const datePart = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `smart-daily-hisab-transactions-${datePart}.csv`);
}

export async function exportReportPDF(
  transactions: Transaction[],
  categories: Category[],
  settings: AppSettings,
  t: TranslationStrings
): Promise<void> {
  // Ensure web fonts (Noto Sans Gujarati / Devanagari) are ready without hanging offline
  if (typeof document !== 'undefined' && document.fonts) {
    await Promise.race([
      document.fonts.ready,
      new Promise<void>((resolve) => setTimeout(resolve, 600)),
    ]);
  }

  const summary = calculateFinancialSummary(transactions, settings.openingBalance);
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const sorted = [...transactions].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt
  );

  // Render crisp high-DPI A4 Canvas pages so Gujarati/Hindi Unicode renders natively without font-embedding loss
  const pageWidth = 1240;
  const pageHeight = 1754;
  const margin = 72;
  const fontStack = '"Plus Jakarta Sans", "Noto Sans Gujarati", "Noto Sans Devanagari", sans-serif';

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [pageWidth / 2, pageHeight / 2] });
  const createCanvas = (): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } => {
    const canvas = document.createElement('canvas');
    canvas.width = pageWidth;
    canvas.height = pageHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, pageWidth, pageHeight);
    return { canvas, ctx };
  };

  let { canvas, ctx } = createCanvas();
  let y = margin;
  let pageNum = 1;

  // Header Banner
  ctx.fillStyle = '#1D4ED8';
  ctx.fillRect(margin, y, pageWidth - margin * 2, 110);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 34px ${fontStack}`;
  ctx.fillText(t.appName, margin + 28, y + 48);
  ctx.font = `400 20px ${fontStack}`;
  ctx.fillStyle = '#DBEAFE';
  ctx.fillText(`${t.appSubtitle} • ${new Date().toISOString().slice(0, 10)}`, margin + 28, y + 84);
  y += 140;

  // Summary Boxes (4 columns)
  const boxW = (pageWidth - margin * 2 - 36) / 4;
  const metrics = [
    { label: t.availableBalance, value: formatMoney(summary.availableBalance, settings.currency), color: '#1D4ED8', bg: '#EFF6FF' },
    { label: t.totalIncome, value: formatMoney(summary.totalIncome, settings.currency), color: '#15803D', bg: '#F0FDF4' },
    { label: t.totalExpenses, value: formatMoney(summary.totalExpenses, settings.currency), color: '#DC2626', bg: '#FEF2F2' },
    { label: t.openingBalance, value: formatMoney(summary.openingBalance, settings.currency), color: '#334155', bg: '#F8FAFC' },
  ];

  metrics.forEach((m, idx) => {
    const bx = margin + idx * (boxW + 12);
    ctx.fillStyle = m.bg;
    ctx.fillRect(bx, y, boxW, 92);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, y, boxW, 92);
    ctx.fillStyle = '#475569';
    ctx.font = `500 18px ${fontStack}`;
    ctx.fillText(m.label, bx + 16, y + 32);
    ctx.fillStyle = m.color;
    ctx.font = `700 24px ${fontStack}`;
    ctx.fillText(m.value, bx + 16, y + 68);
  });
  y += 126;

  // Table header
  const drawTableHeader = () => {
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(margin, y, pageWidth - margin * 2, 46);
    ctx.fillStyle = '#0F172A';
    ctx.font = `700 18px ${fontStack}`;
    ctx.fillText(t.date, margin + 14, y + 30);
    ctx.fillText(t.transactionType, margin + 170, y + 30);
    ctx.fillText(t.category, margin + 300, y + 30);
    ctx.fillText(t.paymentMethod, margin + 560, y + 30);
    ctx.fillText(t.notes, margin + 740, y + 30);
    ctx.fillText(t.amount, pageWidth - margin - 140, y + 30);
    y += 52;
  };

  drawTableHeader();

  for (let i = 0; i < sorted.length; i++) {
    if (y > pageHeight - 100) {
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth / 2, pageHeight / 2);
      pdf.addPage();
      pageNum += 1;
      ({ canvas, ctx } = createCanvas());
      y = margin;
      ctx.fillStyle = '#64748B';
      ctx.font = `500 18px ${fontStack}`;
      ctx.fillText(`${t.appName} — Page ${pageNum}`, margin, y);
      y += 32;
      drawTableHeader();
    }

    const tx = sorted[i];
    if (i % 2 === 1) {
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(margin, y - 4, pageWidth - margin * 2, 42);
    }

    ctx.fillStyle = '#334155';
    ctx.font = `400 18px ${fontStack}`;
    ctx.fillText(tx.date, margin + 14, y + 24);

    ctx.fillStyle = tx.type === 'income' ? '#15803D' : '#DC2626';
    ctx.font = `600 18px ${fontStack}`;
    ctx.fillText(tx.type === 'income' ? t.income : t.expense, margin + 170, y + 24);

    ctx.fillStyle = '#0F172A';
    ctx.font = `500 18px ${fontStack}`;
    const catName = getCategoryLabel(catMap.get(tx.categoryId), settings.language);
    ctx.fillText(catName.slice(0, 20), margin + 300, y + 24);

    ctx.fillStyle = '#475569';
    ctx.font = `400 17px ${fontStack}`;
    ctx.fillText(getPaymentMethodLabel(tx.paymentMethod, t).slice(0, 16), margin + 560, y + 24);
    ctx.fillText((tx.notes || '-').slice(0, 22), margin + 740, y + 24);

    ctx.fillStyle = tx.type === 'income' ? '#15803D' : '#DC2626';
    ctx.font = `700 18px ${fontStack}`;
    const amtText = `${tx.type === 'income' ? '+' : '-'}${formatMoney(tx.amount, settings.currency)}`;
    ctx.fillText(amtText, pageWidth - margin - 140, y + 24);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, y + 38);
    ctx.lineTo(pageWidth - margin, y + 38);
    ctx.stroke();

    y += 44;
  }

  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth / 2, pageHeight / 2);
  const datePart = new Date().toISOString().slice(0, 10);
  pdf.save(`smart-daily-hisab-report-${datePart}.pdf`);
}
