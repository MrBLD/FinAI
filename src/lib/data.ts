import type { Transaction } from './types';
import { formatISO, subDays } from 'date-fns';

const categories = {
  income: {
    'Invest-Income': ['Dividend', 'Interest'],
    'Work-Income': ['Freelance'],
    'Stipend': ['Unknown'],
    'Pocket Money': ['Unknown'],
    'Refund': ['Unknown']
  },
  expense: {
    'Food': ['Groceries', 'Snacks', 'Restraunt', 'Water', 'Mess-ext', 'Sweets', 'Dairy'],
    'Health': ['Medical', 'Fitness'],
    'Invest': ['Stocks', 'Tax'],
    'Misc': ['Recharge', 'Home', 'Hotel'],
    'Miscellaneous': ['Unknown'],
    'Shopping': ['Other', 'Clothes', 'Electronics', 'Home', 'Services', 'Cloth'],
    'Travel': ['Auto', 'Fuel', 'Train', 'Bus', 'Rental', 'Flight', 'Metro', 'Parking'],
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
    const incomeCategories = Object.keys(categories.income);
    category = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
    const subcategories = categories.income[category as keyof typeof categories.income];
    subcategory = subcategories[Math.floor(Math.random() * subcategories.length)];
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
