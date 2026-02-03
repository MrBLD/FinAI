"use client";

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useTransactions } from '@/context/transactions-context';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DateRange } from 'react-day-picker';

export function GlobalFilters() {
  const { transactions } = useTransactions();
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [calendarMonth, setCalendarMonth] = React.useState<Date | undefined>(
    undefined
  );

  const accounts = React.useMemo(() => {
    const accountSet = new Set(transactions.map(t => t.account));
    return Array.from(accountSet).sort();
  }, [transactions]);
  
  const categories = React.useMemo(() => {
    const categorySet = new Set(transactions.map(t => t.category));
    return Array.from(categorySet).sort();
  }, [transactions]);
  
  React.useEffect(() => {
    if (transactions.length > 0) {
      const dates = transactions.map(t => new Date(t.date));
      setDate({ from: new Date(Math.min(...dates.map(d=>d.getTime()))), to: new Date(Math.max(...dates.map(d=>d.getTime()))) });
    }
  }, [transactions]);

  const handleCalendarOpen = (open: boolean) => {
    if (open) {
      setCalendarMonth(date?.from || new Date());
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Popover onOpenChange={handleCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[260px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
            disabled={transactions.length === 0}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            selected={date}
            onSelect={setDate}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>

      <Select disabled={accounts.length === 0}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Accounts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Accounts</SelectItem>
          {accounts.map(account => (
            <SelectItem key={account} value={account}>{account}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select disabled={categories.length === 0}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map(category => (
            <SelectItem key={category} value={category}>{category}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
