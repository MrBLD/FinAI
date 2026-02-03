"use client";

import { useState, useEffect } from 'react';
import type { Transaction } from '@/lib/types';
import { getTransactions } from '@/lib/data';
import KpiCard from '@/components/overview/kpi-card';
import { OverviewCharts } from '@/components/overview/charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, ArrowDown, ArrowUp, PiggyBank, TrendingUp, TrendingDown, Wallet, Goal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parseISO, format } from 'date-fns';

export default function OverviewPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyBudget, setMonthlyBudget] = useState(12000);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const transactions = await getTransactions();
      setData(transactions);
      // Simulate network delay
      setTimeout(() => setLoading(false), 500);
    };
    fetchData();
  }, []);

  const expenseData = data.filter((t) => t.type === 'expense');
  const incomeData = data.filter((t) => t.type === 'income');

  const totalIncome = incomeData.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseData.reduce((sum, t) => sum + t.amount, 0);
  const netCashflow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netCashflow / totalIncome) * 100 : 0;

  const monthlySummary: { [key: string]: { income: number; expense: number } } = {};
  data.forEach((t) => {
    const month = format(parseISO(t.date), 'yyyy-MM');
    if (!monthlySummary[month]) {
      monthlySummary[month] = { income: 0, expense: 0 };
    }
    monthlySummary[month][t.type] += t.amount;
  });

  const monthlyIncomes = Object.values(monthlySummary).map((m) => m.income).filter((i) => i > 0);
  const monthlyExpenses = Object.values(monthlySummary).map((m) => m.expense).filter((e) => e > 0);
  
  const avgMonthlyIncome = monthlyIncomes.length > 0 ? monthlyIncomes.reduce((a, b) => a + b, 0) / monthlyIncomes.length : 0;
  const avgMonthlyExpense = monthlyExpenses.length > 0 ? monthlyExpenses.reduce((a, b) => a + b, 0) / monthlyExpenses.length : 0;

  const budgetVariance = monthlyBudget - avgMonthlyExpense;
  const largestSingleExpense = Math.max(0, ...expenseData.map((t) => t.amount));

  const kpis = [
    { title: 'Total Income', value: totalIncome, icon: ArrowUp, color: 'text-green-500' },
    { title: 'Total Expense', value: totalExpense, icon: ArrowDown, color: 'text-red-500' },
    { title: 'Net Cashflow', value: netCashflow, icon: DollarSign, color: 'text-blue-500' },
    { title: 'Savings Rate', value: savingsRate, isPercentage: true, icon: PiggyBank, color: 'text-indigo-500' },
    { title: 'Avg Monthly Income', value: avgMonthlyIncome, icon: TrendingUp, color: 'text-green-500' },
    { title: 'Avg Monthly Expense', value: avgMonthlyExpense, icon: TrendingDown, color: 'text-red-500' },
    { title: 'Budget Variance', value: budgetVariance, icon: Goal, color: 'text-yellow-500', description: `vs $${new Intl.NumberFormat('en-US').format(monthlyBudget)}/mo budget` },
    { title: 'Largest Expense', value: largestSingleExpense, icon: Wallet, color: 'text-orange-500' },
  ];

  return (
    <div className="flex-1 space-y-4">
      <div className="flex justify-end items-center gap-2">
          <Label htmlFor="monthly-budget" className="text-sm">Monthly Budget</Label>
          <Input
              id="monthly-budget"
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(Number(e.target.value))}
              className="w-32 h-8"
              step="500"
          />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) =>
          loading ? (
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
          ) : (
            <KpiCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              color={kpi.color}
              isPercentage={kpi.isPercentage}
              description={kpi.description}
            />
          )
        )}
      </div>
      <OverviewCharts transactions={data} loading={loading} />
    </div>
  );
}
