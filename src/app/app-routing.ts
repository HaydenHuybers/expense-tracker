import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./components/add-expense/add-expense').then((m) => m.AddExpenseComponent),
  },
  {
    path: 'expenses',
    loadComponent: () =>
      import('./components/expense-list/expense-list').then((m) => m.ExpenseListComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/edit-expense/edit-expense').then((m) => m.EditExpenseComponent),
  },
  { path: '**', redirectTo: '' },
];
