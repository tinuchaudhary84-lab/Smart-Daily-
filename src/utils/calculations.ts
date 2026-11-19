import { Category, CurrencyCode, Language, Transaction } from '../types/hisab';

export interface FinancialSummary {
  openingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
  todayIncome: number;
  todayExpenses: number;
  todayNet: number;
  monthIncome: number;
  monthExpenses: number;
  monthSavings: number;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface MonthlyPoint {
  monthIndex: number; // 0..11
  monthKey: string; // YYYY-MM
  income: number;
  expense: number;
  savings: number;
}

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentMonthPrefix(): string {
  return getTodayISO().slice(0, 7);
}

export function getCategoryLabel(category: Category | undefined, lang: Language): string {
  if (!category) return lang === 'gu' ? 'અન્ય' : lang === 'hi' ? 'अन्य' : 'Other';
  if (lang === 'gu') return category.nameGu || category.nameEn;
  if (lang === 'hi') return category.nameHi || category.nameEn;
  return category.nameEn;
}

export function getCurrencySymbol(currency: CurrencyCode): string {
  switch (currency) {
    case 'INR':
      return '₹';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'AED':
      return 'د.إ';
    default:
      return '₹';
  }
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const isNegative = safe < 0;
  const abs = Math.abs(safe);
  const symbol = getCurrencySymbol(currency);
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

export function calculateFinancialSummary(
  transactions: Transaction[],
  openingBalance: number,
  todayStr = getTodayISO(),
  monthPrefix = getCurrentMonthPrefix()
): FinancialSummary {
  let totalIncome = 0;
  let totalExpenses = 0;
  let todayIncome = 0;
  let todayExpenses = 0;
  let monthIncome = 0;
  let monthExpenses = 0;

  for (const tx of transactions) {
    const amt = Number(tx.amount) || 0;
    if (amt <= 0) continue;
    if (tx.type === 'income') {
      totalIncome += amt;
      if (tx.date === todayStr) todayIncome += amt;
      if (tx.date.startsWith(monthPrefix)) monthIncome += amt;
    } else {
      totalExpenses += amt;
      if (tx.date === todayStr) todayExpenses += amt;
      if (tx.date.startsWith(monthPrefix)) monthExpenses += amt;
    }
  }

  return {
    openingBalance,
    totalIncome,
    totalExpenses,
    availableBalance: openingBalance + totalIncome - totalExpenses,
    todayIncome,
    todayExpenses,
    todayNet: todayIncome - todayExpenses,
    monthIncome,
    monthExpenses,
    monthSavings: monthIncome - monthExpenses,
  };
}

export function computeCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  lang: Language,
  type: 'expense' | 'income' = 'expense'
): CategoryBreakdownItem[] {
  const map = new Map<string, { amount: number; count: number }>();
  let grandTotal = 0;

  for (const tx of transactions) {
    if (tx.type !== type) continue;
    const amt = Number(tx.amount) || 0;
    if (amt <= 0) continue;
    grandTotal += amt;
    const existing = map.get(tx.categoryId) || { amount: 0, count: 0 };
    existing.amount += amt;
    existing.count += 1;
    map.set(tx.categoryId, existing);
  }

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const items: CategoryBreakdownItem[] = [];

  for (const [categoryId, stats] of map.entries()) {
    const cat = catMap.get(categoryId);
    items.push({
      categoryId,
      categoryName: getCategoryLabel(cat, lang),
      color: cat?.color || '#64748B',
      amount: stats.amount,
      percentage: grandTotal > 0 ? (stats.amount / grandTotal) * 100 : 0,
      count: stats.count,
    });
  }

  return items.sort((a, b) => b.amount - a.amount);
}

export function computeYearlyMonthlySeries(
  transactions: Transaction[],
  year: number
): MonthlyPoint[] {
  const yearPrefix = `${year}-`;
  const months: MonthlyPoint[] = Array.from({ length: 12 }, (_, idx) => ({
    monthIndex: idx,
    monthKey: `${year}-${String(idx + 1).padStart(2, '0')}`,
    income: 0,
    expense: 0,
    savings: 0,
  }));

  for (const tx of transactions) {
    if (!tx.date.startsWith(yearPrefix)) continue;
    const monthNum = parseInt(tx.date.slice(5, 7), 10);
    if (Number.isNaN(monthNum) || monthNum < 1 || monthNum > 12) continue;
    const target = months[monthNum - 1];
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      target.income += amt;
    } else {
      target.expense += amt;
    }
  }

  for (const m of months) {
    m.savings = m.income - m.expense;
  }

  return months;
}
