import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardService, DashboardData } from '../../services/dashboard.service';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';

import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';
import { Badge } from '../../../../shared/components/badge/badge';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, TranslateModule, LucideAngularModule, DatePipe],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private dashboardService = inject(DashboardService);
  private workspaceContext = inject(WorkspaceContextService);

  currency = computed(() => this.workspaceContext.currency);

  data = signal<DashboardData | null>(null);
  loading = signal(true);
  today = new Date();

  readonly alerts = computed(() => this.data()?.alerts ?? {
    lowStock: 0,
    noPrice: 0,
    noSales30Days: 0
  });

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