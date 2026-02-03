'use client';

import { format } from 'date-fns';
import { ArrowDown, ArrowUp, Banknote, Book, Home, ShoppingCart, Train, Utensils } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface JournalCardProps {
  transaction: Transaction;
  onEdit: () => void;
}

const categoryIcons: Record<string, React.ReactElement> = {
  Food: <Utensils className="h-4 w-4" />,
  Shopping: <ShoppingCart className="h-4 w-4" />,
  Travel: <Train className="h-4 w-4" />,
  Home: <Home className="h-4 w-4" />,
  Invest: <Banknote className="h-4 w-4" />,
  'Invest-Income': <Banknote className="h-4 w-4" />,
  Misc: <Book className="h-4 w-4" />,
  Default: <Banknote className="h-4 w-4" />,
};

export function JournalCard({ transaction, onEdit }: JournalCardProps) {
  const isExpense = transaction.type === 'expense';
  const indicatorColor = isExpense ? 'bg-red-500' : 'bg-green-500';
  const amountColor = isExpense ? 'text-red-500' : 'text-green-500';
  const indicatorIcon = isExpense ? <ArrowDown className="h-6 w-6 text-white" /> : <ArrowUp className="h-6 w-6 text-white" />;

  const getIcon = (category: string) => {
    return categoryIcons[category] || categoryIcons.Default;
  };

  return (
    <Card onClick={onEdit} className="cursor-pointer hover:bg-card-foreground/5 transition-colors">
      <CardContent className="p-4 flex items-start gap-4">
        <div className={cn('rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0', indicatorColor)}>
          {indicatorIcon}
        </div>
        <div className="flex-grow">
          <div className="flex items-baseline gap-2">
            <p className={cn('text-2xl font-bold', amountColor)}>
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(transaction.amount)}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(transaction.date), 'HH:mm')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">{transaction.account}</Badge>
            <Badge variant="outline" className="flex items-center gap-1">
                {getIcon(transaction.category)}
                {transaction.category}
            </Badge>
            {transaction.subcategory && transaction.subcategory !== 'Unknown' && <Badge variant="outline">{transaction.subcategory}</Badge>}
          </div>
          {transaction.comment && (
            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
              {transaction.comment}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
