import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExpenseService } from '../../services/expense-service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './dashboard.html',
})
export class DashboardComponent {
  service = inject(ExpenseService);
}
