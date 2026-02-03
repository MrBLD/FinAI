'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Transaction } from '@/lib/types';

interface TransactionsContextType {
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransactions: (newTransactions: Transaction[]) => void;
  deleteTransactions: (transactionIds: string[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const addTransactions = (newTransactions: Transaction[]) => {
    setTransactions(prev => [...newTransactions, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteTransactions = (transactionIds: string[]) => {
    const idsToDelete = new Set(transactionIds);
    setTransactions(prev => prev.filter(t => !idsToDelete.has(t.id)));
  }

  return (
    <TransactionsContext.Provider value={{ transactions, setTransactions, addTransactions, deleteTransactions, loading, setLoading }}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
}
