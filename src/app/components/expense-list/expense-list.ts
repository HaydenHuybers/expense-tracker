import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FirestoreService } from '../../services/firestore-service';
import { Transaction } from '../../models/expense';
import { ExpenseItemComponent } from '../expense-item/expense-item';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ExpenseItemComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="expense-list-container">
      <div class="header">
        <h1>All Transactions</h1>
        <button mat-raised-button color="primary" (click)="goToAdd()">
          + Add Transaction
        </button>
      </div>

      <!-- Transactions Cards -->
      <div class="transactions-grid">
        @if (firestoreService.transactions().length > 0) {
          @for (transaction of firestoreService.transactions(); track transaction.id) {
            <app-expense-item
              [expense]="transaction"
              (deleteExpense)="deleteTransaction($event)"
            />
          }
        } @else {
          <div class="no-data">
            <p>No transactions yet. Start by adding a transaction!</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .expense-list-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;

      h1 {
        font-size: 28px;
        font-weight: 500;
        margin: 0;
      }
    }

    .transactions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .no-data {
      grid-column: 1 / -1;
      text-align: center;
      padding: 40px;
      color: #999;

      p {
        font-size: 16px;
      }
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
      }

      .transactions-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class ExpenseListComponent {
  firestoreService = inject(FirestoreService);
  private router = inject(Router);

  goToAdd(): void {
    this.router.navigate(['/add-expense']);
  }

  editTransaction(id: string): void {
    this.router.navigate(['/edit', id]);
  }

  async deleteTransaction(id: string): Promise<void> {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await this.firestoreService.deleteTransaction(id);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  }
}
