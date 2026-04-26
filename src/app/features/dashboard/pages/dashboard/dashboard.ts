import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardData } from '../../../../core/models/dashboard.model';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';

import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, TranslateModule, LucideAngularModule, DatePipe, BaseChartDirective],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private dashboardService = inject(DashboardService);
  private workspaceContext = inject(WorkspaceContextService);

  currency = computed(() => this.workspaceContext.currency);

  data = signal<DashboardData | null>(null);
  loading = signal(true);
  today = new Date();

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    datasets: [
      {
        data: [15000, 22000, 18000, 31000, 25000, 42000, 54000],
        label: 'Ingresos',
        fill: true,
        tension: 0.4,
        borderColor: '#8b5cf6', // primary-500
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#8b5cf6',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        border: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      }
    }
  };

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
  
  getInitials(name: string): string {
    if (!name) return '';
    const words = name.split(' ');
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  get locale() {
    return this.workspaceContext.locale;
  }
}