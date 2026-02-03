export type Transaction = {
  id?: number;
  date: string;
  type: 'income' | 'expense';
  account: string;
  category: string;
  subcategory: string;
  amount: number;
  comment: string;
};
