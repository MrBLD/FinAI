"use client";

import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { parse } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';

import type { Transaction } from '@/lib/types';
import { db } from '@/lib/db';
import { DataTable } from '@/components/transactions/data-table';
import { columns } from '@/components/transactions/columns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TransactionForm } from '@/components/transactions/transaction-form';

export default function TransactionsPage() {
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray());
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedData = results.data as any[];

          const existingTransactions = await db.transactions.toArray();
          const existingKeys = new Set(existingTransactions.map(t => `${t.date}-${t.amount}-${t.comment}`));
          
          const transactionsToAdd: Transaction[] = [];

          parsedData.forEach((row, index) => {
            const amount = parseFloat(row.Amount);
            const dateStr = row.Date;
            const type = row.Type?.trim().toLowerCase();

            if (!dateStr || isNaN(amount) || !type || (type !== 'income' && type !== 'expense')) {
                console.warn(`Skipping invalid row ${index + 2}:`, row);
                return;
            }

            const dateValue = parse(dateStr, 'dd-MM-yyyy HH:mm', new Date());

            if (isNaN(dateValue.getTime())) {
                console.warn(`Skipping invalid date on line ${index + 2}: ${dateStr}`);
                return;
            }

            const newTransaction: Omit<Transaction, 'id'> = {
              date: dateValue.toISOString(),
              type: type,
              account: row.Account?.trim() || 'Unknown',
              category: row.Category?.trim() || 'Uncategorized',
              subcategory: row.Subcategory?.trim() || 'Unknown',
              amount,
              comment: row.Comment?.trim() || '',
            };

            const key = `${newTransaction.date}-${newTransaction.amount}-${newTransaction.comment}`;
            if (!existingKeys.has(key)) {
                transactionsToAdd.push(newTransaction as Transaction);
                existingKeys.add(key);
            }
          });

          if (transactionsToAdd.length > 0) {
            await db.transactions.bulkAdd(transactionsToAdd);
            toast({
              title: "Upload Successful",
              description: `${transactionsToAdd.length} new transactions have been added.`,
            });
          } else {
             toast({
              title: "Upload Complete",
              description: "No new transactions were found to add.",
            });
          }

        } catch (error) {
          console.error("Error processing CSV:", error);
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "There was an error processing the CSV file.",
          });
        } finally {
          setLoading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      },
      error: (error) => {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: `CSV parsing error: ${error.message}`,
        });
        setLoading(false);
      }
    });
  };

  const handleDeleteTransactions = async (rowsToDelete: Transaction[]) => {
    const idsToDelete = rowsToDelete.map((row) => row.id).filter((id): id is number => id !== undefined);
    if(idsToDelete.length > 0) {
      await db.transactions.bulkDelete(idsToDelete);
      toast({
        title: 'Transactions Deleted',
        description: `${idsToDelete.length} transaction(s) have been deleted.`,
      });
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 py-4">
        <Button onClick={() => fileInputRef.current?.click()} disabled={loading}>
          <Upload className="mr-2 h-4 w-4" />
          {loading ? 'Processing...' : 'Upload CSV'}
        </Button>
        <Input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv"
          onChange={handleFileUpload}
        />
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
      {transactions === undefined && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-96 w-full rounded-md border" />
        </div>
      )}
      {transactions && (
        <DataTable columns={columns} data={transactions} onDelete={handleDeleteTransactions} />
      )}
    </div>
  );
}
