import { Injectable, inject, signal, computed, effect } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
  getDoc,
} from '@angular/fire/firestore';
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
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

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
      const transactionsRef = collection(this.firestore, 'transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      onSnapshot(q, (snapshot) => {
        const loaded = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data['date']?.toDate() || new Date(),
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date(),
          } as Transaction;
        });
        this.transactions.set(loaded);
      });
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

      const docRef = await addDoc(collection(this.firestore, 'transactions'), {
        ...transaction,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return docRef.id;
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
      const docRef = doc(this.firestore, 'transactions', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
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
      await deleteDoc(doc(this.firestore, 'transactions', id));
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
      const categoriesRef = collection(this.firestore, 'categories');
      const q = query(
        categoriesRef,
        where('userId', '==', userId)
      );

      onSnapshot(q, (snapshot) => {
        const loaded = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data['createdAt']?.toDate() || new Date(),
          } as Category;
        });
        this.categories.set(loaded);
      });
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }

  async addCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<string> {
    try {
      const userId = this.authService.currentUser()?.id;
      if (!userId) throw new Error('User not authenticated');

      const docRef = await addDoc(collection(this.firestore, 'categories'), {
        ...category,
        userId,
        createdAt: new Date(),
      });

      return docRef.id;
    } catch (err) {
      this.error.set('Failed to add category');
      throw err;
    }
  }

  // ==================== BUDGET OPERATIONS ====================

  private loadBudgets(userId: string): void {
    try {
      const budgetsRef = collection(this.firestore, 'budgets');
      const q = query(
        budgetsRef,
        where('userId', '==', userId)
      );

      onSnapshot(q, (snapshot) => {
        const loaded = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date(),
          } as Budget;
        });
        this.budgets.set(loaded);
      });
    } catch (err) {
      console.error('Error loading budgets:', err);
    }
  }

  async addBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const userId = this.authService.currentUser()?.id;
      if (!userId) throw new Error('User not authenticated');

      const docRef = await addDoc(collection(this.firestore, 'budgets'), {
        ...budget,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return docRef.id;
    } catch (err) {
      this.error.set('Failed to add budget');
      throw err;
    }
  }

  async updateBudget(id: string, updates: Partial<Budget>): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'budgets', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (err) {
      this.error.set('Failed to update budget');
      throw err;
    }
  }

  async deleteBudget(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, 'budgets', id));
    } catch (err) {
      this.error.set('Failed to delete budget');
      throw err;
    }
  }
}
