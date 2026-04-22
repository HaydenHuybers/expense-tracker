import { Injectable, signal, computed, effect, inject } from '@angular/core';
import {
  Transaction,
  Budget,
  Category,
  DashboardStats,
  BudgetAlert,
} from '../models/expense';
import { AuthService } from './auth-service';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private authService = inject(AuthService);
  
  private readonly TRANSACTIONS_KEY = 'expense_tracker_transactions';
  private readonly BUDGETS_KEY = 'expense_tracker_budgets';
  private readonly CATEGORIES_KEY = 'expense_tracker_categories';

  // Transaction signals
  transactions = signal<Transaction[]>([]);
  categories = signal<Category[]>([]);
  budgets = signal<Budget[]>([]);

  // UI state signals
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Computed derived states
  totalIncome = computed(() =>
    this.transactions()
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  totalExpense = computed(() =>
    this.transactions()
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  netBalance = computed(() => this.totalIncome() - this.totalExpense());

  spendingByCategory = computed(() => {
    const spending: { [key: string]: number } = {};
    this.transactions()
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      });
    return Object.entries(spending).map(([category, amount]) => ({
      category,
      amount,
    }));
  });

  dashboardStats = computed((): DashboardStats => {
    const alerts: BudgetAlert[] = [];

    this.budgets().forEach((budget) => {
      const spent = this.transactions()
        .filter(
          (t) =>
            t.type === 'expense' && t.categoryId === budget.categoryId
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = (spent / budget.limit) * 100;

      if (percentage >= 100) {
        alerts.push({
          categoryId: budget.categoryId,
          categoryName: budget.categoryName,
          limit: budget.limit,
          spent,
          percentage,
          status: 'exceeded',
        });
      } else if (percentage >= 75) {
        alerts.push({
          categoryId: budget.categoryId,
          categoryName: budget.categoryName,
          limit: budget.limit,
          spent,
          percentage,
          status: 'warning',
        });
      }
    });

    return {
      totalIncome: this.totalIncome(),
      totalExpense: this.totalExpense(),
      netBalance: this.netBalance(),
      budgetAlerts: alerts,
      spendingByCategory: this.spendingByCategory(),
    };
  });

  constructor() {
    // Subscribe to auth changes and load data when user changes
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadTransactions(user.id);
        this.loadCategories(user.id);
        this.loadBudgets(user.id);
      } else {
        this.transactions.set([]);
        this.categories.set([]);
        this.budgets.set([]);
      }
    });
  }

  // ==================== TRANSACTION OPERATIONS ====================

  private loadTransactions(userId: string): void {
    try {
      const allTransactions = this.getAllTransactions();
      const userTransactions = allTransactions
        .filter(t => t.userId === userId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.transactions.set(userTransactions);
    } catch (err) {
      this.error.set('Failed to load transactions');
      console.error('Error loading transactions:', err);
    }
  }

  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const userId = this.authService.currentUser()?.id;
      if (!userId) throw new Error('User not authenticated');

      await this.delay(300);

      const newTransaction: Transaction = {
        id: this.generateId(),
        ...transaction,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const allTransactions = this.getAllTransactions();
      allTransactions.push(newTransaction);
      localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(allTransactions));

      // Update signal with new transaction
      this.transactions.update(prev => [newTransaction, ...prev]);

      return newTransaction.id;
    } catch (err) {
      this.error.set('Failed to add transaction');
      console.error('Error adding transaction:', err);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.delay(300);

      const allTransactions = this.getAllTransactions();
      const index = allTransactions.findIndex(t => t.id === id);
      
      if (index === -1) throw new Error('Transaction not found');

      allTransactions[index] = {
        ...allTransactions[index],
        ...updates,
        updatedAt: new Date(),
      };

      localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(allTransactions));
      this.loadTransactions(this.authService.currentUser()?.id || '');
    } catch (err) {
      this.error.set('Failed to update transaction');
      console.error('Error updating transaction:', err);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.delay(300);

      const allTransactions = this.getAllTransactions();
      const filtered = allTransactions.filter(t => t.id !== id);
      localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(filtered));
      
      this.transactions.update(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      this.error.set('Failed to delete transaction');
      console.error('Error deleting transaction:', err);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  // ==================== CATEGORY OPERATIONS ====================

  private loadCategories(userId: string): void {
    try {
      const allCategories = this.getAllCategories();
      const userCategories = allCategories.filter(c => c.userId === userId);
      this.categories.set(userCategories);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }

  async addCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<string> {
    try {
      const userId = this.authService.currentUser()?.id;
      if (!userId) throw new Error('User not authenticated');

      const newCategory: Category = {
        id: this.generateId(),
        ...category,
        userId,
        createdAt: new Date(),
      };

      const allCategories = this.getAllCategories();
      allCategories.push(newCategory);
      localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(allCategories));

      this.categories.update(prev => [...prev, newCategory]);
      return newCategory.id;
    } catch (err) {
      this.error.set('Failed to add category');
      console.error('Error adding category:', err);
      throw err;
    }
  }

  // ==================== BUDGET OPERATIONS ====================

  private loadBudgets(userId: string): void {
    try {
      const allBudgets = this.getAllBudgets();
      const userBudgets = allBudgets.filter(b => b.userId === userId);
      this.budgets.set(userBudgets);
    } catch (err) {
      console.error('Error loading budgets:', err);
    }
  }

  async addBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const userId = this.authService.currentUser()?.id;
      if (!userId) throw new Error('User not authenticated');

      const newBudget: Budget = {
        id: this.generateId(),
        ...budget,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const allBudgets = this.getAllBudgets();
      allBudgets.push(newBudget);
      localStorage.setItem(this.BUDGETS_KEY, JSON.stringify(allBudgets));

      this.budgets.update(prev => [...prev, newBudget]);
      return newBudget.id;
    } catch (err) {
      this.error.set('Failed to add budget');
      console.error('Error adding budget:', err);
      throw err;
    }
  }

  async updateBudget(id: string, updates: Partial<Budget>): Promise<void> {
    try {
      const allBudgets = this.getAllBudgets();
      const index = allBudgets.findIndex(b => b.id === id);
      
      if (index === -1) throw new Error('Budget not found');

      allBudgets[index] = {
        ...allBudgets[index],
        ...updates,
        updatedAt: new Date(),
      };

      localStorage.setItem(this.BUDGETS_KEY, JSON.stringify(allBudgets));
      this.loadBudgets(this.authService.currentUser()?.id || '');
    } catch (err) {
      this.error.set('Failed to update budget');
      console.error('Error updating budget:', err);
      throw err;
    }
  }

  async deleteBudget(id: string): Promise<void> {
    try {
      const allBudgets = this.getAllBudgets();
      const filtered = allBudgets.filter(b => b.id !== id);
      localStorage.setItem(this.BUDGETS_KEY, JSON.stringify(filtered));
      
      this.budgets.update(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      this.error.set('Failed to delete budget');
      console.error('Error deleting budget:', err);
      throw err;
    }
  }

  // ==================== UTILITY METHODS ====================

  private getAllTransactions(): Transaction[] {
    const data = localStorage.getItem(this.TRANSACTIONS_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data).map((t: any) => ({
        ...t,
        date: new Date(t.date),
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      }));
    } catch {
      return [];
    }
  }

  private getAllBudgets(): Budget[] {
    const data = localStorage.getItem(this.BUDGETS_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data).map((b: any) => ({
        ...b,
        createdAt: new Date(b.createdAt),
        updatedAt: new Date(b.updatedAt),
      }));
    } catch {
      return [];
    }
  }

  private getAllCategories(): Category[] {
    const data = localStorage.getItem(this.CATEGORIES_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data).map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
      }));
    } catch {
      return [];
    }
  }

  private generateId(): string {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
