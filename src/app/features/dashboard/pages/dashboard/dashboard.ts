import { Component, inject, signal } from '@angular/core';
import { DashboardService, DashboardData } from '../../services/dashboard.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CurrencyPipe],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private dashboardService = inject(DashboardService);

  data = signal<DashboardData | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}