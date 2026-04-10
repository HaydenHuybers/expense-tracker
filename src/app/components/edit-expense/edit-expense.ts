import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExpenseService } from '../../services/expense-service';
import { ExpenseCategory } from '../../models/expense';

@Component({
  selector: 'app-edit-expense',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './edit-expense.html',
})
export class EditExpenseComponent implements OnInit {
  service = inject(ExpenseService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  id = signal('');
  title = signal('');
  amount = signal<number | null>(null);
  category = signal<ExpenseCategory>('Personal');
  notFound = signal(false);
  submitted = signal(false);

  get titleValue() { return this.title(); }
  set titleValue(v: string) { this.title.set(v); }

  get amountValue() { return this.amount(); }
  set amountValue(v: number | null) { this.amount.set(v); }

  get categoryValue() { return this.category(); }
  set categoryValue(v: ExpenseCategory) { this.category.set(v); }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.id.set(id);
    const expense = this.service.getExpenseById(id);
    if (!expense) {
      this.notFound.set(true);
      return;
    }
    this.title.set(expense.title);
    this.amount.set(expense.amount);
    this.category.set(expense.category);
  }

  onSubmit() {
    this.submitted.set(true);
    if (!this.title().trim() || !this.amount() || this.amount()! <= 0) return;

    this.service.editExpense({
      id: this.id(),
      title: this.title().trim(),
      amount: this.amount()!,
      category: this.category(),
    });
    this.router.navigate(['/expenses']);
  }
}
