import React, { useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { getPaymentMethodLabel, TranslationStrings } from '../i18n/translations';
import { AppSettings, Category, Transaction } from '../types/hisab';
import {
  computeCategoryBreakdown,
  computeYearlyMonthlySeries,
  formatMoney,
  getCategoryLabel,
  getCurrentMonthPrefix,
  getTodayISO,
} from '../utils/calculations';
import { CategoryIcon } from './CategoryIcon';

interface ReportsViewProps {
  transactions: Transaction[];
  categories: Category[];
  settings: AppSettings;
  t: TranslationStrings;
}

type ReportPeriod = 'daily' | 'monthly' | 'yearly';

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  categories,
  settings,
  t,
}) => {
  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthPrefix());
  const [selectedYear, setSelectedYear] = useState(Number(getTodayISO().slice(0, 4)));
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [hoveredBarIdx, setHoveredBarIdx] = useState<number | null>(null);

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Daily computations
  const dailyData = useMemo(() => {
    const list = transactions
      .filter((tx) => tx.date === selectedDate)
      .sort((a, b) => b.createdAt - a.createdAt);
    let income = 0;
    let expense = 0;
    for (const tx of list) {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    }
    return { list, income, expense, net: income - expense };
  }, [transactions, selectedDate]);

  // Monthly computations
  const monthlyData = useMemo(() => {
    const list = transactions.filter((tx) => tx.date.startsWith(selectedMonth));
    let income = 0;
    let expense = 0;
    for (const tx of list) {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    }

    const [yStr, mStr] = selectedMonth.split('-');
    const daysInMonth = new Date(Number(yStr), Number(mStr), 0).getDate() || 30;
    const dailyExpenses = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      expense: 0,
    }));
    for (const tx of list) {
      if (tx.type === 'expense') {
        const dayNum = parseInt(tx.date.slice(8, 10), 10);
        if (dayNum >= 1 && dayNum <= daysInMonth) {
          dailyExpenses[dayNum - 1].expense += tx.amount;
        }
      }
    }

    const categoryBreakdown = computeCategoryBreakdown(list, categories, settings.language, 'expense');
    return {
      list,
      income,
      expense,
      savings: income - expense,
      dailyExpenses,
      categoryBreakdown,
    };
  }, [transactions, selectedMonth, categories, settings.language]);

  // Yearly computations
  const yearlyData = useMemo(() => {
    const yearPrefix = `${selectedYear}-`;
    const list = transactions.filter((tx) => tx.date.startsWith(yearPrefix));
    const series = computeYearlyMonthlySeries(transactions, selectedYear);
    let income = 0;
    let expense = 0;
    for (const m of series) {
      income += m.income;
      expense += m.expense;
    }
    const categoryBreakdown = computeCategoryBreakdown(list, categories, settings.language, 'expense');
    return {
      income,
      expense,
      savings: income - expense,
      series,
      categoryBreakdown,
    };
  }, [transactions, selectedYear, categories, settings.language]);

  const activeIncome =
    period === 'daily'
      ? dailyData.income
      : period === 'monthly'
        ? monthlyData.income
        : yearlyData.income;
  const activeExpense =
    period === 'daily'
      ? dailyData.expense
      : period === 'monthly'
        ? monthlyData.expense
        : yearlyData.expense;
  const activeNet = activeIncome - activeExpense;

  const activeCategoryBreakdown =
    period === 'daily'
      ? computeCategoryBreakdown(dailyData.list, categories, settings.language, 'expense')
      : period === 'monthly'
        ? monthlyData.categoryBreakdown
        : yearlyData.categoryBreakdown;

  // Pie Chart geometry
  const pieSegments = useMemo(() => {
    const total = activeCategoryBreakdown.reduce((acc, item) => acc + item.amount, 0);
    if (total <= 0) return [];
    let currentAngle = -90;
    return activeCategoryBreakdown.map((item) => {
      const sliceAngle = (item.amount / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;
      return { ...item, startAngle, endAngle };
    });
  }, [activeCategoryBreakdown]);

  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const rad = Math.PI / 180;
    // Handle full 360 degree single-category slice cleanly
    if (endAngle - startAngle >= 359.9) {
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
    }
    const x1 = cx + r * Math.cos(startAngle * rad);
    const y1 = cy + r * Math.sin(startAngle * rad);
    const x2 = cx + r * Math.cos(endAngle * rad);
    const y2 = cy + r * Math.sin(endAngle * rad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const availableYears = useMemo(() => {
    const set = new Set<number>([Number(getTodayISO().slice(0, 4))]);
    transactions.forEach((tx) => {
      const y = parseInt(tx.date.slice(0, 4), 10);
      if (!Number.isNaN(y)) set.add(y);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Header + Period Selector */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          {t.reportsTitle}
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['daily', 'monthly', 'yearly'] as ReportPeriod[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  period === p
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p === 'daily' ? t.dailyReport : p === 'monthly' ? t.monthlyReport : t.yearlyReport}
              </button>
            ))}
          </div>

          {period === 'daily' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium tabular-nums text-slate-900 dark:text-white"
            />
          )}
          {period === 'monthly' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium tabular-nums text-slate-900 dark:text-white"
            />
          )}
          {period === 'yearly' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium tabular-nums text-slate-900 dark:text-white"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 3-Card Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {period === 'daily'
              ? t.todayIncome
              : period === 'monthly'
                ? t.monthlyIncome
                : t.annualIncome}
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {formatMoney(activeIncome, settings.currency)}
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {period === 'daily'
              ? t.todayExpenses
              : period === 'monthly'
                ? t.monthlyExpenses
                : t.annualExpenses}
          </p>
          <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">
            {formatMoney(activeExpense, settings.currency)}
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {period === 'daily'
              ? t.todayNetBalance
              : period === 'monthly'
                ? t.monthlySavings
                : t.annualSavings}
          </p>
          <p
            className={`mt-2 text-2xl font-bold tabular-nums ${
              activeNet >= 0
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatMoney(activeNet, settings.currency)}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Income vs Expense Bar Chart */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            {t.chartIncomeVsExpense}
          </h2>
          {activeIncome === 0 && activeExpense === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center text-slate-400 text-sm">
              <BarChart3 className="w-8 h-8 mb-2 opacity-60" />
              <span>{t.noDataForPeriod}</span>
            </div>
          ) : (
            <div className="space-y-5 pt-2">
              {(() => {
                const maxVal = Math.max(activeIncome, activeExpense, 1);
                const incPct = Math.round((activeIncome / maxVal) * 100);
                const expPct = Math.round((activeExpense / maxVal) * 100);
                return (
                  <>
                    <div>
                      <div className="flex justify-between text-sm font-semibold mb-1.5">
                        <span className="text-emerald-700 dark:text-emerald-400">{t.income}</span>
                        <span className="tabular-nums text-slate-900 dark:text-white">
                          {formatMoney(activeIncome, settings.currency)}
                        </span>
                      </div>
                      <div className="h-9 w-full rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-xl bg-emerald-600 transition-all duration-300"
                          style={{ width: `${incPct}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm font-semibold mb-1.5">
                        <span className="text-red-600 dark:text-red-400">{t.expense}</span>
                        <span className="tabular-nums text-slate-900 dark:text-white">
                          {formatMoney(activeExpense, settings.currency)}
                        </span>
                      </div>
                      <div className="h-9 w-full rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-xl bg-red-600 transition-all duration-300"
                          style={{ width: `${expPct}%` }}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Chart 2: Category-wise Expense Pie Chart */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            {t.chartCategoryPie}
          </h2>
          {pieSegments.length === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center text-slate-400 text-sm">
              <BarChart3 className="w-8 h-8 mb-2 opacity-60" />
              <span>{t.noDataForPeriod}</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-48 h-48 shrink-0">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {pieSegments.map((seg) => {
                    const isHovered = hoveredSlice === seg.categoryId;
                    return (
                      <path
                        key={seg.categoryId}
                        d={describeArc(100, 100, isHovered ? 88 : 82, seg.startAngle, seg.endAngle)}
                        fill={seg.color}
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white dark:text-slate-900 transition-all duration-150 cursor-pointer"
                        onMouseEnter={() => setHoveredSlice(seg.categoryId)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        onClick={() =>
                          setHoveredSlice((prev) =>
                            prev === seg.categoryId ? null : seg.categoryId
                          )
                        }
                      />
                    );
                  })}
                  <circle
                    cx="100"
                    cy="100"
                    r="46"
                    className="fill-white dark:fill-slate-900"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
                  {hoveredSlice ? (
                    (() => {
                      const active = pieSegments.find((s) => s.categoryId === hoveredSlice);
                      return active ? (
                        <>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[82px]">
                            {active.categoryName}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                            {active.percentage.toFixed(1)}%
                          </span>
                        </>
                      ) : null;
                    })()
                  ) : (
                    <>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.expense}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatMoney(activeExpense, settings.currency)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="w-full space-y-2 max-h-52 overflow-y-auto pr-1">
                {pieSegments.map((seg) => (
                  <div
                    key={seg.categoryId}
                    onMouseEnter={() => setHoveredSlice(seg.categoryId)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className={`flex items-center justify-between gap-2 text-xs py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                      hoveredSlice === seg.categoryId ? 'bg-slate-100 dark:bg-slate-800' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-xs shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {seg.categoryName}
                      </span>
                    </div>
                    <div className="text-right shrink-0 tabular-nums font-semibold text-slate-900 dark:text-white">
                      {formatMoney(seg.amount, settings.currency)}{' '}
                      <span className="text-slate-500 dark:text-slate-400 font-normal">
                        ({seg.percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart 3: Monthly Daily Expense Trend Graph */}
      {period === 'monthly' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.chartMonthlyTrend} ({selectedMonth})
            </h2>
            {hoveredBarIdx !== null && monthlyData.dailyExpenses[hoveredBarIdx] && (
              <span className="text-xs font-semibold tabular-nums text-red-600 dark:text-red-400">
                {selectedMonth}-{String(monthlyData.dailyExpenses[hoveredBarIdx].day).padStart(2, '0')}:{' '}
                {formatMoney(monthlyData.dailyExpenses[hoveredBarIdx].expense, settings.currency)}
              </span>
            )}
          </div>
          {monthlyData.expense === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">{t.noDataForPeriod}</p>
          ) : (
            <div className="h-44 flex items-end gap-1 pt-6">
              {(() => {
                const maxDay = Math.max(...monthlyData.dailyExpenses.map((d) => d.expense), 1);
                return monthlyData.dailyExpenses.map((d, idx) => {
                  const pct = (d.expense / maxDay) * 100;
                  return (
                    <div
                      key={d.day}
                      onMouseEnter={() => setHoveredBarIdx(idx)}
                      onMouseLeave={() => setHoveredBarIdx(null)}
                      onClick={() => setHoveredBarIdx(idx)}
                      className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
                    >
                      <div
                        className={`w-full rounded-t-md transition-all ${
                          hoveredBarIdx === idx
                            ? 'bg-red-700 dark:bg-red-400'
                            : 'bg-red-500/80 dark:bg-red-500/70'
                        }`}
                        style={{ height: d.expense > 0 ? `${Math.max(pct, 6)}%` : '2px' }}
                      />
                      <span className="mt-1.5 text-[9px] tabular-nums text-slate-400">
                        {d.day % 5 === 1 || d.day === monthlyData.dailyExpenses.length ? d.day : ''}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      )}

      {/* Chart 4: Yearly Financial Overview + Month-wise Comparison */}
      {period === 'yearly' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.chartYearlyOverview} ({selectedYear})
            </h2>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
                {t.income}
              </span>
              <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-red-600" />
                {t.expense}
              </span>
            </div>
          </div>

          <div className="h-52 flex items-end gap-2 pt-4">
            {(() => {
              const maxMonth = Math.max(
                ...yearlyData.series.flatMap((m) => [m.income, m.expense]),
                1
              );
              return yearlyData.series.map((m) => {
                const incH = (m.income / maxMonth) * 100;
                const expH = (m.expense / maxMonth) * 100;
                return (
                  <div key={m.monthKey} className="flex-1 h-full flex flex-col justify-end items-center">
                    <div className="w-full h-full flex items-end justify-center gap-0.5">
                      <div
                        className="w-1/2 rounded-t-sm bg-emerald-600"
                        style={{ height: m.income > 0 ? `${Math.max(incH, 4)}%` : '2px' }}
                        title={`${t.monthsShort[m.monthIndex]} ${t.income}: ${formatMoney(m.income, settings.currency)}`}
                      />
                      <div
                        className="w-1/2 rounded-t-sm bg-red-600"
                        style={{ height: m.expense > 0 ? `${Math.max(expH, 4)}%` : '2px' }}
                        title={`${t.monthsShort[m.monthIndex]} ${t.expense}: ${formatMoney(m.expense, settings.currency)}`}
                      />
                    </div>
                    <span className="mt-2 text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-full">
                      {t.monthsShort[m.monthIndex]}
                    </span>
                  </div>
                );
              });
            })()}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 pr-4 font-semibold">{t.monthCol}</th>
                  <th className="py-2.5 px-4 font-semibold text-right">{t.income}</th>
                  <th className="py-2.5 px-4 font-semibold text-right">{t.expense}</th>
                  <th className="py-2.5 pl-4 font-semibold text-right">{t.savingsCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {yearlyData.series.map((m) => (
                  <tr key={m.monthKey}>
                    <td className="py-2.5 pr-4 font-medium text-slate-900 dark:text-white">
                      {t.monthsShort[m.monthIndex]} {selectedYear}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-emerald-700 dark:text-emerald-400 font-medium">
                      {formatMoney(m.income, settings.currency)}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-red-600 dark:text-red-400 font-medium">
                      {formatMoney(m.expense, settings.currency)}
                    </td>
                    <td
                      className={`py-2.5 pl-4 text-right tabular-nums font-bold ${
                        m.savings >= 0
                          ? 'text-blue-700 dark:text-blue-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {formatMoney(m.savings, settings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily Complete Transaction List */}
      {period === 'daily' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            {t.dailyTransactions} ({selectedDate})
          </h2>
          {dailyData.list.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">{t.noDataForPeriod}</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {dailyData.list.map((tx) => {
                const cat = catMap.get(tx.categoryId);
                const isInc = tx.type === 'income';
                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat?.color || '#64748B'}1A`, color: cat?.color || '#64748B' }}
                      >
                        <CategoryIcon name={cat?.icon || 'Tag'} className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {getCategoryLabel(cat, settings.language)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {getPaymentMethodLabel(tx.paymentMethod, t)}
                          {tx.notes ? ` · ${tx.notes}` : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        isInc ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isInc ? '+' : '-'}
                      {formatMoney(tx.amount, settings.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
