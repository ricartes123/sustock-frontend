import { Component, inject, signal, computed } from '@angular/core';
import { DashboardService, DashboardData } from '../../services/dashboard.service';
import { CurrencyPipe } from '@angular/common';
import { BusinessContextService } from '../../../../core/services/business-context.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CurrencyPipe],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private dashboardService = inject(DashboardService);
  private businessContext = inject(BusinessContextService);

  currency = computed(() => this.businessContext.currency);

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
  get locale() {
    return this.businessContext.locale;
  }
}