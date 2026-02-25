import { Component, inject, signal, computed } from '@angular/core';
import { DashboardService, DashboardData } from '../../services/dashboard.service';
import { CurrencyPipe } from '@angular/common';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';

import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private dashboardService = inject(DashboardService);
  private workspaceContext = inject(WorkspaceContextService);

  currency = computed(() => this.workspaceContext.currency);

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
    return this.workspaceContext.locale;
  }
}