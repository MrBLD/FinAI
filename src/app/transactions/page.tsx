"use client";

import { useRef } from 'react';
import type { Transaction } from '@/lib/types';
import { useTransactions } from '@/context/transactions-context';
import { DataTable } from '@/components/transactions/data-table';
import { columns } from '@/components/transactions/columns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function TransactionsPage() {
  const { transactions, addTransactions, deleteTransactions, loading, setLoading } = useTransactions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.trim().split('\n');
        const header = lines.shift();

        const newTransactions: Transaction[] = lines
          .map((line, index) => {
            if (!line.trim()) return null;

            const values = line.split(',');
            if (values.length < 6) {
              console.warn(`Skipping invalid line (not enough columns) ${index + 2}: ${line}`);
              return null;
            }

            const [dateStr, type, account, category, subcategory, amountStr, ...commentParts] = values;
            const comment = commentParts.join(',').trim().replace(/"/g, '');

            const dateValue = (() => {
                const trimmedDateStr = dateStr.trim();
                if (!trimmedDateStr) return null;
                const parts = trimmedDateStr.split(' ');
                if (parts.length !== 2) return null;
                const dateParts = parts[0].split('-');
                const timeParts = parts[1].split(':');
                if (dateParts.length !== 3 || timeParts.length !== 2) return null;
                const day = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1;
                const year = parseInt(dateParts[2], 10);
                const hours = parseInt(timeParts[0], 10);
                const minutes = parseInt(timeParts[1], 10);
                if ([day, month, year, hours, minutes].some(isNaN)) return null;
                const date = new Date(year, month, day, hours, minutes);
                if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
                    return null;
                }
                return date;
            })();

            if (!dateValue || isNaN(dateValue.getTime())) {
                console.warn(`Skipping invalid date on line ${index + 2}: ${line}`);
                return null;
            }
            
            const amount = parseFloat(amountStr);
            const transactionType = type.trim().toLowerCase();

            if (isNaN(amount) || (transactionType !== 'income' && transactionType !== 'expense')) {
              console.warn(`Skipping invalid data on line ${index + 2}: ${line}`);
              return null;
            }

            return {
              id: `csv_${new Date().getTime()}_${index}`,
              date: dateValue.toISOString(),
              type: transactionType as 'income' | 'expense',
              account: account.trim(),
              category: category.trim(),
              subcategory: subcategory.trim(),
              amount,
              comment: comment,
            };
          })
          .filter((t): t is Transaction => t !== null);

        addTransactions(newTransactions);
        toast({
          title: "Upload Successful",
          description: `${newTransactions.length} transactions have been added.`,
        });
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "There was an error parsing the CSV file. Please check the format.",
        });
      } finally {
        setLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Could not read the selected file.",
        });
        setLoading(false);
    }
    reader.readAsText(file);
  };

  const handleDeleteTransactions = (rowsToDelete: Transaction[]) => {
    const idsToDelete = rowsToDelete.map((row) => row.id);
    deleteTransactions(idsToDelete);
    toast({
      title: 'Transactions Deleted',
      description: `${idsToDelete.length} transaction(s) have been deleted.`,
    });
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
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
      </div>
      {loading && transactions.length === 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-96 w-full rounded-md border" />
        </div>
      ) : (
        <DataTable columns={columns} data={transactions} onDelete={handleDeleteTransactions} />
      )}
    </div>
  );
}
