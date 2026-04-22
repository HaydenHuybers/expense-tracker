import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FirestoreService } from '../../services/firestore-service';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatTableModule,
    MatProgressBarModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="goToAddExpense()">
            + Add Expense
          </button>
          <button mat-button (click)="logout()">Logout</button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card income">
          <mat-card-content>
            <div class="stat-label">Total Income</div>
            <div class="stat-value">
              \${{ firestoreService.totalIncome().toFixed(2) }}
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card expense">
          <mat-card-content>
            <div class="stat-label">Total Expense</div>
            <div class="stat-value">
              \${{ firestoreService.totalExpense().toFixed(2) }}
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card balance">
          <mat-card-content>
            <div class="stat-label">Net Balance</div>
            <div class="stat-value">
              \${{ firestoreService.netBalance().toFixed(2) }}
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="charts-grid">
          <!-- Charts placeholder - Add chart implementation here if needed -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Spending Summary</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="no-data">Chart visualization would go here</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Budget Alerts -->
      @if (firestoreService.dashboardStats().budgetAlerts.length > 0) {
        <mat-card class="budget-alerts">
          <mat-card-header>
            <mat-card-title>Budget Alerts</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="alerts-list">
              @for (
                alert of firestoreService.dashboardStats().budgetAlerts;
                track alert.categoryId
              ) {
                <div [ngClass]="['alert-item', alert.status]">
                  <div class="alert-header">
                    <span class="category-name">{{ alert.categoryName }}</span>
                    <span
                      [ngClass]="['status-badge', alert.status]"
                    >
                      {{ alert.status === 'exceeded' ? 'Exceeded' : 'Warning' }}
                    </span>
                  </div>
                  <mat-progress-bar
                    mode="determinate"
                    [value]="Math.min(alert.percentage, 100)"
                  ></mat-progress-bar>
                  <div class="alert-details">
                    <span>
                      \${{ alert.spent.toFixed(2) }} / \${{
                        alert.limit.toFixed(2)
                      }}
                    </span>
                    <span>{{ alert.percentage.toFixed(0) }}%</span>
                  </div>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Recent Transactions -->
      <mat-card class="recent-transactions">
        <mat-card-header>
          <mat-card-title>Recent Transactions</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (firestoreService.transactions().length > 0) {
            <table mat-table [dataSource]="recentTransactions()">
              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell>Date</th>
                <td mat-cell *matCellDef="let element">
                  {{ element.date | date: 'MMM d, yyyy' }}
                </td>
              </ng-container>

              <!-- Category Column -->
              <ng-container matColumnDef="category">
                <th mat-header-cell>Category</th>
                <td mat-cell *matCellDef="let element">
                  {{ element.category }}
                </td>
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

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          } @else {
            <p class="no-data">No transactions yet</p>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .dashboard-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;

      h1 {
        font-size: 32px;
        font-weight: 500;
        margin: 0;
      }

      .header-actions {
        display: flex;
        gap: 10px;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      text-align: center;

      mat-card-content {
        padding: 20px;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 600;
      }

      &.income {
        border-top: 4px solid #4caf50;

        .stat-value {
          color: #4caf50;
        }
      }

      &.expense {
        border-top: 4px solid #f44336;

        .stat-value {
          color: #f44336;
        }
      }

      &.balance {
        border-top: 4px solid #2196f3;

        .stat-value {
          color: #2196f3;
        }
      }
    }

    .charts-section {
      margin-bottom: 30px;

      .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 20px;
      }

      .chart-card {
        min-height: 400px;

        mat-card-content {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        canvas {
          max-height: 300px;
        }

        .no-data {
          text-align: center;
          color: #999;
        }
      }
    }

    .budget-alerts {
      margin-bottom: 30px;

      .alerts-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .alert-item {
        padding: 15px;
        border-radius: 8px;
        background-color: #f5f5f5;

        &.warning {
          background-color: #fff3cd;
        }

        &.exceeded {
          background-color: #f8d7da;
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;

          .category-name {
            font-weight: 600;
            font-size: 16px;
          }

          .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;

            &.warning {
              background-color: #ffc107;
              color: white;
            }

            &.exceeded {
              background-color: #f44336;
              color: white;
            }
          }
        }

        mat-progress-bar {
          margin-bottom: 10px;
        }

        .alert-details {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #666;
        }
      }
    }

    .recent-transactions {
      table {
        width: 100%;

        th {
          background-color: #f5f5f5;
          font-weight: 600;
        }

        td.income {
          color: #4caf50;
          font-weight: 600;
        }

        td.expense {
          color: #f44336;
          font-weight: 600;
        }
      }

      .no-data {
        text-align: center;
        padding: 20px;
        color: #999;
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .charts-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 15px;
      }
    }
  `,
})
export class DashboardComponent implements OnInit {
  firestoreService = inject(FirestoreService);
  authService = inject(AuthService);
  private router = inject(Router);

  // Charts removed - use alternative visualization
  displayedColumns = ['date', 'category', 'amount', 'notes'];
  Math = Math;

  categoryChartData: any = { labels: [], datasets: [] };
  incomeExpenseChartData: any = { labels: [], datasets: [] };
  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  ngOnInit(): void {
    this.updateCharts();
  }

  updateCharts(): void {
    // Category Pie Chart
    const spendingData = this.firestoreService.spendingByCategory();
    const colors = this.generateColors(spendingData.length);

    this.categoryChartData = {
      labels: spendingData.map((item) => item.category),
      datasets: [
        {
          data: spendingData.map((item) => item.amount),
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 2,
        },
      ],
    };

    // Income vs Expense Bar Chart
    this.incomeExpenseChartData = {
      labels: ['Income', 'Expense'],
      datasets: [
        {
          label: 'Amount',
          data: [
            this.firestoreService.totalIncome(),
            this.firestoreService.totalExpense(),
          ],
          backgroundColor: ['#4caf50', '#f44336'],
        },
      ],
    };
  }

  private generateColors(count: number): string[] {
    const colors = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
      '#FF6384',
      '#C9CBCF',
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  }

  recentTransactions() {
    return this.firestoreService.transactions().slice(0, 5);
  }

  goToAddExpense(): void {
    this.router.navigate(['/add-expense']);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}
