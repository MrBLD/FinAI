'use client';

import { useState } from 'react';
import { useTransactions } from '@/context/transactions-context';
import type { Transaction } from '@/lib/types';
import { JournalCard } from '@/components/journal/journal-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function JournalPage() {
  const { transactions, loading, deleteTransactions } = useTransactions();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const groupedTransactions = transactions.reduce((acc, tx) => {
    const date = new Date(tx.date).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const handleDelete = () => {
    if (editingTransaction) {
      deleteTransactions([editingTransaction.id]);
      toast({
        title: 'Transaction Deleted',
        description: 'The transaction has been successfully deleted.',
      });
      setEditingTransaction(undefined);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Manual
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
            </DialogHeader>
            <TransactionForm onFinished={() => setAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {loading && transactions.length === 0 ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : transactions.length > 0 ? (
        Object.entries(groupedTransactions).map(([date, txs]) => (
          <div key={date}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            <div className="space-y-4">
              {txs.map(tx => (
                <JournalCard key={tx.id} transaction={tx} onEdit={() => setEditingTransaction(tx)} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center mt-10">
          <h2 className="text-2xl font-semibold mb-2">No Transactions Yet</h2>
          <p className="text-muted-foreground">Upload a CSV or add a manual transaction to see your journal.</p>
        </div>
      )}

      <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(undefined)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-row justify-between items-center pr-6">
            <DialogTitle>Edit Transaction</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm
              transaction={editingTransaction}
              onFinished={() => setEditingTransaction(undefined)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
