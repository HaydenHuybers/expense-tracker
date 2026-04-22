import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FirestoreService } from '../../services/firestore-service';

@Component({
  selector: 'app-edit-expense',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="edit-expense-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>Edit Transaction</mat-card-title>
          <button mat-icon-button (click)="goBack()" class="back-button">
            ← Back
          </button>
        </mat-card-header>

        <mat-card-content>
          @if (firestoreService.error()) {
            <div class="error-message">{{ firestoreService.error() }}</div>
          }

          @if (transactionForm) {
            <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()">
              <!-- Transaction Type -->
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Transaction Type</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="expense">Expense</mat-option>
                  <mat-option value="income">Income</mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Title/Description -->
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Description</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="title"
                  placeholder="e.g., Grocery Shopping"
                />
                @if (
                  transactionForm.get('title')?.invalid &&
                  transactionForm.get('title')?.touched
                ) {
                  <mat-error>Description is required</mat-error>
                }
              </mat-form-field>

              <!-- Amount -->
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Amount</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="amount"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                @if (
                  transactionForm.get('amount')?.invalid &&
                  transactionForm.get('amount')?.touched
                ) {
                  <mat-error>Please enter a valid amount</mat-error>
                }
              </mat-form-field>

              <!-- Category -->
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category">
                  @for (category of categories; track category) {
                    <mat-option [value]="category">
                      {{ category }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <!-- Date -->
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Date</mat-label>
                <input
                  matInput
                  [matDatepicker]="picker"
                  formControlName="date"
                />
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              <!-- Notes -->
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Notes (Optional)</mat-label>
                <textarea
                  matInput
                  formControlName="notes"
                  placeholder="Add any additional notes"
                  rows="3"
                ></textarea>
              </mat-form-field>

              <!-- Buttons -->
              <div class="button-group">
                <button
                  mat-raised-button
                  color="primary"
                  type="submit"
                  [disabled]="!transactionForm.valid || firestoreService.isLoading()"
                >
                  @if (firestoreService.isLoading()) {
                    Updating...
                  } @else {
                    Update Transaction
                  }
                </button>
                <button
                  mat-raised-button
                  color="warn"
                  type="button"
                  (click)="deleteTransaction()"
                  [disabled]="firestoreService.isLoading()"
                >
                  Delete
                </button>
                <button mat-button type="button" (click)="goBack()">
                  Cancel
                </button>
              </div>
            </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .edit-expense-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }

    .form-card {
      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .back-button {
          font-size: 16px;
        }
      }
    }

    mat-form-field {
      margin-bottom: 20px;
    }

    .full-width {
      width: 100%;
    }

    .error-message {
      color: #f44336;
      padding: 10px;
      margin-bottom: 15px;
      background-color: #ffebee;
      border-radius: 4px;
    }

    .button-group {
      display: flex;
      gap: 10px;
      margin-top: 20px;

      button {
        flex: 1;
      }
    }

    @media (max-width: 600px) {
      .edit-expense-container {
        padding: 10px;
      }

      .button-group {
        flex-direction: column;
      }
    }
  `,
})
export class EditExpenseComponent implements OnInit {
  firestoreService = inject(FirestoreService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  transactionForm: FormGroup | null = null;
  transactionId: string | null = null;

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

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.transactionId = params['id'];
      const transaction = this.firestoreService
        .transactions()
        .find((t) => t.id === this.transactionId);

      if (transaction) {
        this.transactionForm = this.fb.group({
          type: [transaction.type, Validators.required],
          title: [transaction.title, [Validators.required, Validators.minLength(3)]],
          amount: [transaction.amount, [Validators.required, Validators.min(0.01)]],
          category: [transaction.category, Validators.required],
          date: [transaction.date, Validators.required],
          notes: [transaction.notes || ''],
        });
      } else {
        this.snackBar.open('Transaction not found', 'Close', { duration: 3000 });
        this.goBack();
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.transactionForm?.valid && this.transactionId) {
      try {
        const formValue = this.transactionForm.value;
        await this.firestoreService.updateTransaction(this.transactionId, {
          title: formValue.title,
          amount: formValue.amount,
          category: formValue.category,
          type: formValue.type,
          date: formValue.date,
          notes: formValue.notes,
        } as any);

        this.snackBar.open('Transaction updated successfully!', 'Close', {
          duration: 3000,
        });
        this.router.navigate(['/dashboard']);
      } catch (error) {
        this.snackBar.open('Failed to update transaction. Please try again.', 'Close', {
          duration: 3000,
        });
      }
    }
  }

  async deleteTransaction(): Promise<void> {
    if (confirm('Are you sure you want to delete this transaction?')) {
      if (this.transactionId) {
        try {
          await this.firestoreService.deleteTransaction(this.transactionId);
          this.snackBar.open('Transaction deleted successfully!', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/dashboard']);
        } catch (error) {
          this.snackBar.open(
            'Failed to delete transaction. Please try again.',
            'Close',
            { duration: 3000 }
          );
        }
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
