import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ExpenseService } from '../../services/expense-service';
import { ExpenseCategory } from '../../models/expense';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './add-expense.html',
})
export class AddExpenseComponent {
  service = inject(ExpenseService);
  router = inject(Router);

  title = signal('');
  amount = signal<number | null>(null);
  category = signal<ExpenseCategory>('Personal');

  get titleValue() { return this.title(); }
  set titleValue(v: string) { this.title.set(v); }

  get amountValue() { return this.amount(); }
  set amountValue(v: number | null) { this.amount.set(v); }

  get categoryValue() { return this.category(); }
  set categoryValue(v: ExpenseCategory) { this.category.set(v); }

  submitted = signal(false);

  onSubmit() {
    this.submitted.set(true);
    if (!this.title().trim() || !this.amount() || this.amount()! <= 0) return;

    this.service.addExpense({
      title: this.title().trim(),
      amount: this.amount()!,
      category: this.category(),
    });
    this.router.navigate(['/expenses']);
  }
}
