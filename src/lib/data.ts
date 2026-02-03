import type { Transaction } from './types';
import { subMonths, formatISO, subDays } from 'date-fns';

const categories = {
  income: ['Salary', 'Freelance', 'Investment'],
  expense: {
    'Housing': ['Rent', 'Mortgage', 'Utilities'],
    'Transportation': ['Gas', 'Public Transit', 'Car Maintenance'],
    'Food': ['Groceries', 'Restaurants', 'Coffee Shops'],
    'Personal': ['Shopping', 'Health', 'Entertainment'],
    'Bills': ['Phone', 'Internet', 'Insurance'],
  },
};

const accounts = ['Main Bank', 'Credit Card', 'Savings', 'Digital Wallet'];

const generateRandomTransaction = (id: number): Transaction => {
  const date = subDays(new Date(), Math.floor(Math.random() * 365));
  const type = Math.random() > 0.3 ? 'expense' : 'income';
  const account = accounts[Math.floor(Math.random() * accounts.length)];
  let category: string;
  let subcategory: string;
  let amount: number;

  if (type === 'income') {
    category = categories.income[Math.floor(Math.random() * categories.income.length)];
    subcategory = 'N/A';
    amount = Math.floor(Math.random() * 4000) + 1000;
  } else {
    const expenseCategories = Object.keys(categories.expense);
    category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
    const subcategories = categories.expense[category as keyof typeof categories.expense];
    subcategory = subcategories[Math.floor(Math.random() * subcategories.length)];
    amount = Math.floor(Math.random() * 200) + 5;
  }

  return {
    id: `txn_${id}`,
    date: formatISO(date),
    type,
    account,
    category,
    subcategory,
    amount,
    comment: `Random transaction ${id}`,
  };
};

const transactions: Transaction[] = Array.from({ length: 500 }, (_, i) => generateRandomTransaction(i + 1));

export const getTransactions = async (): Promise<Transaction[]> => {
  // Simulate an async API call
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(transactions);
    }, 100);
  });
};

export const getAccounts = async (): Promise<string[]> => {
    return new Promise(resolve => resolve(accounts));
}

export const getCategories = async (): Promise<string[]> => {
    return new Promise(resolve => resolve(Object.keys(categories.expense)));
}
