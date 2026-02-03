"use client"

import * as React from "react"
import { Area, Bar, Line, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, AreaChart, LineChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { Transaction } from "@/lib/types"
import { parseISO, format, startOfMonth } from "date-fns"
import { Skeleton } from "../ui/skeleton"

const processNetCashflowData = (transactions: Transaction[]) => {
  const monthlySummary: { [key: string]: { income: number, expense: number } } = {};

  transactions.forEach(t => {
    const monthKey = format(startOfMonth(parseISO(t.date)), 'yyyy-MM');
    if (!monthlySummary[monthKey]) {
      monthlySummary[monthKey] = { income: 0, expense: 0 };
    }
    monthlySummary[monthKey][t.type] += t.amount;
  });

  return Object.entries(monthlySummary)
    .map(([monthKey, { income, expense }]) => ({
      month: format(new Date(monthKey + '-02'), 'MMM yy'),
      net: income - expense,
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
};

const processCumulativeCashflowData = (netCashflowData: { month: string, net: number }[]) => {
    let cumulative = 0;
    return netCashflowData.map(data => {
        cumulative += data.net;
        return { ...data, cumulative };
    });
};

const processTopCategoryTrends = (transactions: Transaction[]) => {
    const categorySpend: { [key: string]: number } = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
    });
    const topCategories = Object.entries(categorySpend).sort((a,b) => b[1] - a[1]).slice(0, 3).map(c => c[0]);

    const monthlyCategorySpend: { [key: string]: { [category: string]: number } } = {};
    transactions.filter(t => t.type === 'expense' && topCategories.includes(t.category)).forEach(t => {
        const monthKey = format(startOfMonth(parseISO(t.date)), 'yyyy-MM');
        if(!monthlyCategorySpend[monthKey]) monthlyCategorySpend[monthKey] = {};
        monthlyCategorySpend[monthKey][t.category] = (monthlyCategorySpend[monthKey][t.category] || 0) + t.amount;
    });

    return {
        data: Object.entries(monthlyCategorySpend).map(([monthKey, spends]) => ({
            month: format(new Date(monthKey + '-02'), 'MMM yy'),
            ...spends
        })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()),
        categories: topCategories,
    };
};

const ChartCard = ({ title, description, children, loading }: { title: string, description: string, children: React.ReactNode, loading: boolean }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      {loading ? <Skeleton className="h-[300px] w-full" /> : children}
    </CardContent>
  </Card>
);

export function TrendsCharts({ transactions, loading }: { transactions: Transaction[], loading: boolean }) {
  const netCashflowData = React.useMemo(() => processNetCashflowData(transactions), [transactions]);
  const cumulativeData = React.useMemo(() => processCumulativeCashflowData(netCashflowData), [netCashflowData]);
  const topCategoryTrends = React.useMemo(() => processTopCategoryTrends(transactions), [transactions]);

  return (
    <div className="grid gap-4">
      <ChartCard title="Net Cashflow Trend" description="Monthly net cashflow over time." loading={loading}>
        <ChartContainer config={{}} className="h-[300px] w-full">
            <BarChart data={netCashflowData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="net" >
                    {netCashflowData.map(d => <Cell key={d.month} fill={d.net >= 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))'} />)}
                </Bar>
            </BarChart>
        </ChartContainer>
      </ChartCard>
      
      <ChartCard title="Cumulative Net Cashflow" description="Your growing (or shrinking) bottom line." loading={loading}>
        <ChartContainer config={{ cumulative: { label: 'Cumulative', color: 'hsl(var(--chart-1))' }}} className="h-[300px] w-full">
            <AreaChart data={cumulativeData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <defs>
                    <linearGradient id="fillCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-cumulative)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-cumulative)" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="cumulative" stroke="var(--color-cumulative)" fill="url(#fillCumulative)" />
            </AreaChart>
        </ChartContainer>
      </ChartCard>
      
      <ChartCard title="Top 3 Category Spending" description="How your spending in top categories changed over time." loading={loading}>
        <ChartContainer config={{
            [topCategoryTrends.categories[0]]: { label: topCategoryTrends.categories[0], color: 'hsl(var(--chart-1))' },
            [topCategoryTrends.categories[1]]: { label: topCategoryTrends.categories[1], color: 'hsl(var(--chart-2))' },
            [topCategoryTrends.categories[2]]: { label: topCategoryTrends.categories[2], color: 'hsl(var(--chart-3))' },
        }} className="h-[300px] w-full">
            <LineChart data={topCategoryTrends.data}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {topCategoryTrends.categories.map((cat, i) => (
                    <Line key={cat} type="monotone" dataKey={cat} stroke={`var(--color-${cat})`} strokeWidth={2} />
                ))}
            </LineChart>
        </ChartContainer>
      </ChartCard>
    </div>
  )
}
