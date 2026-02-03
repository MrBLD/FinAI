'use client';

import { useState } from 'react';
import { useTransactions } from '@/context/transactions-context';
import KpiCard from '@/components/overview/kpi-card';
import { OverviewCharts } from '@/components/overview/charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  ArrowDown,
  ArrowUp,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Wallet,
  Goal,
  Activity,
  Banknote,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parseISO, format } from 'date-fns';

export default function OverviewPage() {
  const { transactions: data, loading } = useTransactions();
  const [monthlyBudget, setMonthlyBudget] = useState(12000);

  const expenseData = data.filter((t) => t.type === 'expense');
  const incomeData = data.filter((t) => t.type === 'income');

  const totalIncome = incomeData.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseData.reduce((sum, t) => sum + t.amount, 0);
  const netCashflow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netCashflow / totalIncome) * 100 : 0;

  const monthlySummary: { [key: string]: { income: number; expense: number } } =
    {};
  data.forEach((t) => {
    const month = format(parseISO(t.date), 'yyyy-MM');
    if (!monthlySummary[month]) {
      monthlySummary[month] = { income: 0, expense: 0 };
    }
    monthlySummary[month][t.type] += t.amount;
  });

  const monthlyIncomes = Object.values(monthlySummary)
    .map((m) => m.income)
    .filter((i) => i > 0);
  const monthlyExpenses = Object.values(monthlySummary)
    .map((m) => m.expense)
    .filter((e) => e > 0);

  const avgMonthlyIncome =
    monthlyIncomes.length > 0
      ? monthlyIncomes.reduce((a, b) => a + b, 0) / monthlyIncomes.length
      : 0;
  const avgMonthlyExpense =
    monthlyExpenses.length > 0
      ? monthlyExpenses.reduce((a, b) => a + b, 0) / monthlyExpenses.length
      : 0;
  const expenseToIncomeRatio =
    avgMonthlyIncome > 0 ? (avgMonthlyExpense / avgMonthlyIncome) * 100 : 0;

  const budgetVariance = monthlyBudget - avgMonthlyExpense;
  const budgetUtilization =
    monthlyBudget > 0 ? (avgMonthlyExpense / monthlyBudget) * 100 : 0;

  const monthlyExpenseStdDev =
    monthlyExpenses.length > 1
      ? Math.sqrt(
          monthlyExpenses
            .map((x) => Math.pow(x - avgMonthlyExpense, 2))
            .reduce((a, b) => a + b, 0) /
            (monthlyExpenses.length - 1)
        )
      : 0;

  const largestSingleExpense = Math.max(
    0,
    ...expenseData.map((t) => t.amount)
  );
  const largestSingleIncome = Math.max(0, ...incomeData.map((t) => t.amount));

  const kpis = [
    {
      title: 'Total Income',
      value: totalIncome,
      icon: ArrowUp,
      color: 'text-green-500',
    },
    {
      title: 'Total Expense',
      value: totalExpense,
      icon: ArrowDown,
      color: 'text-red-500',
    },
    {
      title: 'Net Cashflow',
      value: netCashflow,
      icon: DollarSign,
      color: 'text-blue-500',
    },
    {
      title: 'Savings Rate',
      value: savingsRate,
      isPercentage: true,
      icon: PiggyBank,
      color: 'text-indigo-500',
    },
    {
      title: 'Avg Monthly Expense',
      value: avgMonthlyExpense,
      icon: TrendingDown,
      color: 'text-red-500',
    },
    {
      title: 'Expense / Income',
      value: expenseToIncomeRatio,
      isPercentage: true,
      icon: TrendingUp,
      color: 'text-yellow-500',
    },
    {
      title: 'Budget Utilization',
      value: budgetUtilization,
      isPercentage: true,
      icon: Goal,
      color: 'text-orange-500',
    },
    {
      title: 'Budget Variance',
      value: budgetVariance,
      icon: Wallet,
      color: 'text-purple-500',
      description: `vs ₹${new Intl.NumberFormat('en-IN').format(
        monthlyBudget
      )}/mo budget`,
    },
    {
      title: 'Avg Monthly Income',
      value: avgMonthlyIncome,
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      title: 'Monthly Expense Volatility',
      value: monthlyExpenseStdDev,
      icon: Activity,
      color: 'text-pink-500',
    },
    {
      title: 'Largest Single Expense',
      value: largestSingleExpense,
      icon: Banknote,
      color: 'text-red-600',
    },
    {
      title: 'Largest Single Income',
      value: largestSingleIncome,
      icon: Banknote,
      color: 'text-green-600',
    },
  ];

  if (loading && data.length === 0) {
    return (
      <div className="flex-1 space-y-4">
        <div className="flex justify-end items-center gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="w-32 h-8" />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Skeleton className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <OverviewCharts transactions={[]} loading={true} />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4">
      {data.length > 0 ? (
        <>
          <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2">
            <Label htmlFor="monthly-budget" className="text-sm shrink-0">
              Monthly Budget
            </Label>
            <Input
              id="monthly-budget"
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(Number(e.target.value))}
              className="w-full sm:w-32 h-8"
              step="500"
            />
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <KpiCard
                key={kpi.title}
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
                color={kpi.color}
                isPercentage={kpi.isPercentage}
                description={kpi.description}
              />
            ))}
          </div>
          <OverviewCharts transactions={data} loading={loading} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
          <p className="text-muted-foreground">
            Please upload a CSV file on the Transactions page to get started.
          </p>
        </div>
      )}
    </div>
  );
}
