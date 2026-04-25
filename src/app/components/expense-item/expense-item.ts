import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Transaction } from '../../models/expense';

@Component({
  selector: 'app-expense-item',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, TitleCasePipe],
  templateUrl: './expense-item.html',
})
export class ExpenseItemComponent {
  expense = input.required<Transaction>();
  deleteExpense = output<string>();

  onDelete() {
    this.deleteExpense.emit(this.expense().id);
  }

  /** Returns a Bootstrap badge color class based on category */
  categoryBadgeClass(): string {
    const map: Record<string, string> = {
      Work: 'bg-primary',
      Personal: 'bg-secondary',
      Grocery: 'bg-success',
      Utilities: 'bg-info text-dark',
      Shopping: 'bg-warning text-dark',
      Travel: 'bg-danger',
      Food: 'bg-dark',
    };
    return map[this.expense().category] ?? 'bg-secondary';
  }

  /** Returns true when the expense is considered high (>= $200) and is an expense */
  isHighExpense(): boolean {
    return this.expense().type === 'expense' && this.expense().amount >= 200;
  }
}
