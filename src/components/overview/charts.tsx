"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts"
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
import { parseISO, format, getDay } from "date-fns"
import { Skeleton } from "../ui/skeleton"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const processMonthlyData = (transactions: Transaction[]) => {
  const monthlySummary: { [key: string]: { income: number, expense: number } } = {};

  transactions.forEach(t => {
    const month = format(parseISO(t.date), 'MMM');
    if (!monthlySummary[month]) {
      monthlySummary[month] = { income: 0, expense: 0 };
    }
    monthlySummary[month][t.type] += t.amount;
  });
  
  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  return monthOrder.map(month => ({
    month,
    income: monthlySummary[month]?.income || 0,
    expense: monthlySummary[month]?.expense || 0,
  })).filter(d => d.income > 0 || d.expense > 0);
};

const processCategoryData = (transactions: Transaction[]) => {
  const categorySpend: { [key: string]: number } = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
  });
  return Object.entries(categorySpend).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 6);
};

const processAccountData = (transactions: Transaction[]) => {
    const accountUsage: { [key: string]: number } = {};
    transactions.forEach(t => {
        accountUsage[t.account] = (accountUsage[t.account] || 0) + 1;
    });
    return Object.entries(accountUsage).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
};

const processDayOfWeekData = (transactions: Transaction[]) => {
    const dayOfWeekSpend: { [key: number]: number } = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0};
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    transactions.filter(t => t.type === 'expense').forEach(t => {
        const day = getDay(parseISO(t.date));
        dayOfWeekSpend[day] += t.amount;
    });
    return Object.entries(dayOfWeekSpend).map(([dayIndex, amount]) => ({
        day: dayNames[parseInt(dayIndex)],
        amount,
    }));
}

const ChartCard = ({ title, description, children, loading }: { title: string, description: string, children: React.ReactNode, loading: boolean }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      {loading ? <Skeleton className="h-[250px] w-full" /> : children}
    </CardContent>
  </Card>
);

export function OverviewCharts({ transactions, loading }: { transactions: Transaction[], loading: boolean }) {
  const monthlyData = React.useMemo(() => processMonthlyData(transactions), [transactions]);
  const categoryData = React.useMemo(() => processCategoryData(transactions), [transactions]);
  const accountData = React.useMemo(() => processAccountData(transactions), [transactions]);
  const dayOfWeekData = React.useMemo(() => processDayOfWeekData(transactions), [transactions]);

  const monthlyChartConfig = {
    income: { label: "Income", color: "hsl(var(--chart-2))" },
    expense: { label: "Expense", color: "hsl(var(--chart-1))" },
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartCard title="Income vs. Expense" description="Monthly comparison of income and expenses." loading={loading}>
        <ChartContainer config={monthlyChartConfig} className="h-[250px] w-full">
          <BarChart data={monthlyData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
          </BarChart>
        </ChartContainer>
      </ChartCard>
      <ChartCard title="Category Spending" description="Top 6 spending categories." loading={loading}>
        <ChartContainer config={{}} className="h-[250px] w-full">
            <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            </PieChart>
        </ChartContainer>
      </ChartCard>
      <ChartCard title="Account Usage" description="Number of transactions per account." loading={loading}>
          <ChartContainer config={{}} className="h-[250px] w-full">
            <PieChart>
                <Pie data={accountData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label>
                    {accountData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            </PieChart>
          </ChartContainer>
      </ChartCard>
      <ChartCard title="Expense by Day" description="Total expenses per day of the week." loading={loading}>
        <ChartContainer config={{ amount: { label: "Amount", color: "hsl(var(--chart-1))" } }} className="h-[250px] w-full">
            <BarChart data={dayOfWeekData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
            </BarChart>
        </ChartContainer>
      </ChartCard>
    </div>
  )
}
