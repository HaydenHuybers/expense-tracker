// Category Types
export type ExpenseCategoryType =
  | 'Food'
  | 'Rent'
  | 'Travel'
  | 'Shopping'
  | 'Utilities'
  | 'Entertainment'
  | 'Healthcare'
  | 'Education'
  | 'Work'
  | 'Personal'
  | 'Grocery';

export type TransactionType = 'income' | 'expense';

// User Model
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  budget?: number;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category Model
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  userId: string;
  isDefault: boolean;
  createdAt: Date;
}

// Transaction/Expense Model
export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategoryType;
}

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  categoryId: string;
  type: TransactionType;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Budget Model
export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  limit: number;
  period: 'monthly' | 'yearly';
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard Statistics
export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  budgetAlerts: BudgetAlert[];
  spendingByCategory: { category: string; amount: number }[];
}

// Budget Alert
export interface BudgetAlert {
  categoryId: string;
  categoryName: string;
  limit: number;
  spent: number;
  percentage: number;
  status: 'warning' | 'exceeded';
}
