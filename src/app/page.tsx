"use client";

import { useState, useEffect } from 'react';
import type { Transaction } from '@/lib/types';
import { getTransactions } from '@/lib/data';
import KpiCard from '@/components/overview/kpi-card';
import { OverviewCharts } from '@/components/overview/charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, ArrowDown, ArrowUp, PiggyBank } from 'lucide-react';

export default function OverviewPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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

  const totalIncome = data
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = data
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashflow = totalIncome - totalExpense;

  const savingsRate = totalIncome > 0 ? (netCashflow / totalIncome) * 100 : 0;

  const kpis = [
    { title: 'Total Income', value: totalIncome, icon: ArrowUp, color: 'text-green-500' },
    { title: 'Total Expense', value: totalExpense, icon: ArrowDown, color: 'text-red-500' },
    { title: 'Net Cashflow', value: netCashflow, icon: DollarSign, color: 'text-blue-500' },
    { title: 'Savings Rate', value: savingsRate, isPercentage: true, icon: PiggyBank, color: 'text-indigo-500' },
  ];

  return (
    <div className="flex-1 space-y-4">
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
            />
          )
        )}
      </div>
      <OverviewCharts transactions={data} loading={loading} />
    </div>
  );
}
