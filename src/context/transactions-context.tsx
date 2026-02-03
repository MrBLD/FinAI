'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Transaction } from '@/lib/types';

interface TransactionsContextType {
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransactions: (newTransactions: Transaction[]) => void;
  updateTransaction: (updatedTransaction: Transaction) => void;
  deleteTransactions: (transactionIds: string[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

const STORAGE_KEY = 'finai_transactions';

// Helper functions for localStorage operations
const loadTransactionsFromStorage = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error loading transactions from localStorage:', error);
    return [];
  }
};

const saveTransactionsToStorage = (transactions: Transaction[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions to localStorage:', error);
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Consider clearing old data.');
    }
  }
};

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactionsState] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load transactions from localStorage on mount
  useEffect(() => {
    const loadedTransactions = loadTransactionsFromStorage();
    if (loadedTransactions.length > 0) {
      setTransactionsState(loadedTransactions);
    }
    setIsHydrated(true);
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (isHydrated) {
      saveTransactionsToStorage(transactions);
    }
  }, [transactions, isHydrated]);

  const setTransactions = (transactions: Transaction[]) => {
    setTransactionsState(transactions);
  };

  const addTransactions = (newTransactions: Transaction[]) => {
    setTransactionsState(prev => [...newTransactions, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactionsState(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }

  const deleteTransactions = (transactionIds: string[]) => {
    const idsToDelete = new Set(transactionIds);
    setTransactionsState(prev => prev.filter(t => !idsToDelete.has(t.id)));
  }

  return (
    <TransactionsContext.Provider value={{ transactions, setTransactions, addTransactions, updateTransaction, deleteTransactions, loading, setLoading }}>
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
