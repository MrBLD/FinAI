"use client";

import { useState, useEffect } from 'react';
import { getTransactions } from '@/lib/data';
import type { Transaction } from '@/lib/types';
import { TrendsCharts } from '@/components/trends/charts';

export default function TrendsPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex-1 space-y-4">
      <TrendsCharts transactions={data} loading={loading} />
    </div>
  );
}
