"use client";

import { useState, useEffect, useRef } from 'react';
import type { Transaction } from '@/lib/types';
import { getTransactions } from '@/lib/data';
import { DataTable } from '@/components/transactions/data-table';
import { columns } from '@/components/transactions/columns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function TransactionsPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.trim().split('\n');
        lines.shift(); // Remove header row

        const newTransactions: Transaction[] = lines
          .map((line, index) => {
            if (!line.trim()) return null;

            const values = line.split(',');
            // Assuming CSV format: date,type,account,category,subcategory,amount,comment
            if (values.length < 7) {
              console.warn(`Skipping invalid line (not enough columns) ${index + 2}: ${line}`);
              return null;
            }

            const [dateStr, type, account, category, subcategory, amountStr, ...commentParts] = values;
            const comment = commentParts.join(',').trim().replace(/"/g, '');


            const amount = parseFloat(amountStr);
            const transactionType = type.trim().toLowerCase();

            if (isNaN(amount) || (transactionType !== 'income' && transactionType !== 'expense') || !dateStr) {
              console.warn(`Skipping invalid data on line ${index + 2}: ${line}`);
              return null;
            }

            return {
              id: `csv_${new Date().getTime()}_${index}`,
              date: new Date(dateStr.trim()).toISOString(),
              type: transactionType as 'income' | 'expense',
              account: account.trim(),
              category: category.trim(),
              subcategory: subcategory.trim(),
              amount,
              comment: comment,
            };
          })
          .filter((t): t is Transaction => t !== null);

        setData(prevData => [...newTransactions, ...prevData]);
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
      {loading && data.length === 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-96 w-full rounded-md border" />
        </div>
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  );
}
