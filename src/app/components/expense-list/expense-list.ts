import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FirestoreService } from '../../services/firestore-service';
import { Transaction } from '../../models/expense';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
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

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-form-field appearance="fill" class="filter-field">
          <mat-label>Filter by Type</mat-label>
          <mat-select [ngModel]="selectedType()" (ngModelChange)="selectedType.set($event)">
            <mat-option value="">All</mat-option>
            <mat-option value="expense">Expense</mat-option>
            <mat-option value="income">Income</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="filter-field">
          <mat-label>Filter by Category</mat-label>
          <mat-select [ngModel]="selectedCategory()" (ngModelChange)="selectedCategory.set($event)">
            <mat-option value="">All</mat-option>
            @for (category of categories; track category) {
              <mat-option [value]="category">{{ category }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="filter-field">
          <mat-label>Search</mat-label>
          <input
            matInput
            [ngModel]="searchText()"
            (ngModelChange)="searchText.set($event)"
            placeholder="Search by description..."
          />
        </mat-form-field>

        <button mat-button (click)="clearFilters()">Clear Filters</button>
      </mat-card>

      <!-- Transactions Table -->
      <mat-card class="transactions-card">
        @if (filteredTransactions().length > 0) {
          <table mat-table [dataSource]="filteredTransactions()" class="transactions-table">
            <!-- Date Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell>Date</th>
              <td mat-cell *matCellDef="let element">
                {{ element.date | date: 'MMM d, yyyy' }}
              </td>
            </ng-container>

            <!-- Type Column -->
            <ng-container matColumnDef="type">
              <th mat-header-cell>Type</th>
              <td
              mat-cell
              *matCellDef="let element"
              [ngClass]="element.type === 'income' ? 'income' : 'expense'"
            >
              {{ element.type | titlecase }}
            </td>
            </ng-container>

            <!-- Description Column -->
            <ng-container matColumnDef="title">
              <th mat-header-cell>Description</th>
              <td mat-cell *matCellDef="let element">{{ element.title }}</td>
            </ng-container>

            <!-- Category Column -->
            <ng-container matColumnDef="category">
              <th mat-header-cell>Category</th>
              <td mat-cell *matCellDef="let element">{{ element.category }}</td>
            </ng-container>

            <!-- Amount Column -->
            <ng-container matColumnDef="amount">
              <th mat-header-cell>Amount</th>
              <td
                mat-cell
                *matCellDef="let element"
                [ngClass]="element.type === 'income' ? 'income' : 'expense'"
              >
                {{ element.type === 'income' ? '+' : '-' }}\${{
                  element.amount.toFixed(2)
                }}
              </td>
            </ng-container>

            <!-- Notes Column -->
            <ng-container matColumnDef="notes">
              <th mat-header-cell>Notes</th>
              <td mat-cell *matCellDef="let element">
                {{ element.notes || '-' }}
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell>Actions</th>
              <td mat-cell *matCellDef="let element">
                <button
                  mat-icon-button
                  matTooltip="Edit"
                  (click)="editTransaction(element.id)"
                >
                  Edit
                </button>
                <button
                  mat-icon-button
                  matTooltip="Delete"
                  (click)="deleteTransaction(element.id)"
                >
                  Delete
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        } @else {
          <div class="no-data">
            <p>No transactions found. {{ searchText() ? 'Try adjusting your filters.' : 'Start by adding a transaction!' }}</p>
          </div>
        }
      </mat-card>
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

    .filters-card {
      padding: 20px;
      margin-bottom: 20px;
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      align-items: center;

      .filter-field {
        flex: 1;
        min-width: 150px;
      }
    }

    .transactions-card {
      overflow-x: auto;
    }

    .transactions-table {
      width: 100%;

      th {
        background-color: #f5f5f5;
        font-weight: 600;
      }

      td {
        padding: 12px;
      }

      .income {
        color: #4caf50;
        font-weight: 600;
      }

      .expense {
        color: #f44336;
        font-weight: 600;
      }
    }

    .no-data {
      padding: 40px;
      text-align: center;
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

      .filters-card {
        flex-direction: column;

        .filter-field {
          width: 100%;
        }
      }

      .transactions-table {
        font-size: 12px;

        td, th {
          padding: 8px;
        }
      }
    }
  `,
})
export class ExpenseListComponent {
  firestoreService = inject(FirestoreService);
  private router = inject(Router);

  displayedColumns = ['date', 'type', 'title', 'category', 'amount', 'notes', 'actions'];
  searchText = signal('');
  selectedType = signal('');
  selectedCategory = signal('');

  categories = [
    'Food',
    'Rent',
    'Travel',
    'Shopping',
    'Utilities',
    'Entertainment',
    'Healthcare',
    'Education',
    'Work',
    'Personal',
    'Grocery',
  ];

  filteredTransactions = computed(() => {
    let filtered = this.firestoreService.transactions();

    // Filter by type
    if (this.selectedType()) {
      filtered = filtered.filter((t) => t.type === this.selectedType());
    }

    // Filter by category
    if (this.selectedCategory()) {
      filtered = filtered.filter((t) => t.category === this.selectedCategory());
    }

    // Filter by search text
    if (this.searchText()) {
      const search = this.searchText().toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.category.toLowerCase().includes(search) ||
          (t.notes && t.notes.toLowerCase().includes(search))
      );
    }

    return filtered;
  });

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

  clearFilters(): void {
    this.searchText.set('');
    this.selectedType.set('');
    this.selectedCategory.set('');
  }
}
