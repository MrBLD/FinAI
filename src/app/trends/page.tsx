"use client";

import { TrendsCharts } from '@/components/trends/charts';
import { useTransactions } from '@/context/transactions-context';

export default function TrendsPage() {
  const { transactions, loading } = useTransactions();

  if (loading && transactions.length === 0) {
      return (
          <div className="flex-1 space-y-4">
              <TrendsCharts transactions={[]} loading={true} />
          </div>
      );
  }

  return (
    <div className="flex-1 space-y-4">
        {transactions.length > 0 ? (
            <TrendsCharts transactions={transactions} loading={loading} />
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
                <p className="text-muted-foreground">Please upload a CSV file on the Transactions page to get started.</p>
            </div>
        )}
    </div>
  );
}
