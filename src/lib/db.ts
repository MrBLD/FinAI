import Dexie, { type Table } from 'dexie';
import type { Transaction } from './types';

export class FinanceDB extends Dexie {
  transactions!: Table<Transaction>; 

  constructor() {
    super('FinanceDB');
    this.version(1).stores({
      transactions: '++id, date, type, account, category, subcategory, amount',
    });
  }
}

export const db = new FinanceDB();
