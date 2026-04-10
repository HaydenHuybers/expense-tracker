import { Injectable, computed, signal } from '@angular/core';
import { Expense, ExpenseCategory } from '../models/expense';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  categories = signal<ExpenseCategory[]>([
    'Work',
    'Personal',
    'Grocery',
    'Utilities',
    'Shopping',
    'Travel',
    'Food',
  ]);

  expenses = signal<Expense[]>([
    { id: crypto.randomUUID(), title: 'Office Supplies', amount: 45.99, category: 'Work' },
    { id: crypto.randomUUID(), title: 'Grocery Run', amount: 120.5, category: 'Grocery' },
    { id: crypto.randomUUID(), title: 'Flight Ticket', amount: 350.0, category: 'Travel' },
  ]);

  totalExpense = computed(() =>
    this.expenses().reduce((sum, e) => sum + e.amount, 0)
  );

  transactionCount = computed(() => this.expenses().length);

  highestExpense = computed(() =>
    this.expenses().reduce(
      (max, e) => (e.amount > max ? e.amount : max),
      0
    )
  );

  averageExpense = computed(() =>
    this.transactionCount() === 0
      ? 0
      : this.totalExpense() / this.transactionCount()
  );

  addExpense(expense: Omit<Expense, 'id'>): void {
    const newExpense: Expense = { ...expense, id: crypto.randomUUID() };
    this.expenses.update((list) => [...list, newExpense]);
  }

  deleteExpense(id: string): void {
    this.expenses.update((list) => list.filter((e) => e.id !== id));
  }

  getExpenseById(id: string): Expense | undefined {
    return this.expenses().find((e) => e.id === id);
  }

  editExpense(updated: Expense): void {
    this.expenses.update((list) =>
      list.map((e) => (e.id === updated.id ? updated : e))
    );
  }
}
