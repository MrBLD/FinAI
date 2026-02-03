"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts"
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#a4de6c", "#d0ed57", "#ffc658"];

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
  return Object.entries(categorySpend).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
};

const processAccountData = (transactions: Transaction[]) => {
    const accountUsage: { [key: string]: number } = {};
    transactions.forEach(t => {
        accountUsage[t.account] = (accountUsage[t.account] || 0) + t.amount;
    });
    return Object.entries(accountUsage).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
};

const processDayOfWeekData = (transactions: Transaction[]) => {
    const dayOfWeekSpend = Array(7).fill(0);
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    transactions.filter(t => t.type === 'expense').forEach(t => {
        const day = getDay(parseISO(t.date)); // Sun: 0, Mon: 1, ..., Sat: 6
        const index = day === 0 ? 6 : day - 1; // Mon: 0, Tue: 1, ..., Sun: 6
        dayOfWeekSpend[index] += t.amount;
    });
    return dayNames.map((day, index) => ({
        day,
        amount: dayOfWeekSpend[index],
    }));
}

const processWeekdayWeekendData = (transactions: Transaction[]) => {
    const spend = { Weekday: 0, Weekend: 0 };
    transactions.filter(t => t.type === 'expense').forEach(t => {
        const day = getDay(parseISO(t.date)); // Sun: 0, Sat: 6
        if (day === 0 || day === 6) {
            spend.Weekend += t.amount;
        } else {
            spend.Weekday += t.amount;
        }
    });
    return [{ name: 'Weekday', value: spend.Weekday }, { name: 'Weekend', value: spend.Weekend }];
};


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
  const weekdayWeekendData = React.useMemo(() => processWeekdayWeekendData(transactions), [transactions]);

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
            <ChartTooltip formatter={(value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value as number)} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
          </BarChart>
        </ChartContainer>
      </ChartCard>
      <ChartCard title="Expense Share by Category" description="Breakdown of spending by category." loading={loading}>
        <ChartContainer config={{}} className="h-[250px] w-full">
            <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <ChartTooltip formatter={(value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value as number)} content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
        </ChartContainer>
      </ChartCard>
      <ChartCard title="Spend by Account" description="Total spending from each account." loading={loading}>
          <ChartContainer config={{}} className="h-[250px] w-full">
            <PieChart>
                <Pie data={accountData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label>
                    {accountData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <ChartTooltip formatter={(value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value as number)} content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
      </ChartCard>
      <ChartCard title="Expense by Day" description="Total expenses per day of the week." loading={loading}>
        <ChartContainer config={{ amount: { label: "Amount", color: "hsl(var(--chart-1))" } }} className="h-[250px] w-full">
            <BarChart data={dayOfWeekData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip formatter={(value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value as number)} content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
            </BarChart>
        </ChartContainer>
      </ChartCard>
      <ChartCard title="Weekday vs. Weekend Spend" description="Comparison of spending on weekdays vs. weekends." loading={loading}>
        <ChartContainer config={{ value: { label: "Amount" } }} className="h-[250px] w-full">
            <BarChart data={weekdayWeekendData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis tickFormatter={(value) => `₹${(value as number / 1000)}k`} />
              <ChartTooltip formatter={(value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value as number)} content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={4}>
                {weekdayWeekendData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
        </ChartContainer>
      </ChartCard>
    </div>
  )
}
