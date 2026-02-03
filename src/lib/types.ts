export type Transaction = {
  id: string;
  date: string;
  type: 'income' | 'expense';
  account: string;
  category: string;
  subcategory: string;
  amount: number;
  comment: string;
};
