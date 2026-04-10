import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExpenseService } from '../../services/expense-service';
import { ExpenseItemComponent } from '../expense-item/expense-item';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [RouterLink, ExpenseItemComponent],
  templateUrl: './expense-list.html',
})
export class ExpenseListComponent {
  service = inject(ExpenseService);

  onDelete(id: string) {
    this.service.deleteExpense(id);
  }
}
