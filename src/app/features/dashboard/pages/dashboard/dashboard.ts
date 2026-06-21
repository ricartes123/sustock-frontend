import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardData } from '../../../../core/models/dashboard.model';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';
import { ThemeService } from '../../../../core/services/theme.service';

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
  private themeService = inject(ThemeService);

  constructor() {
    effect(() => {
      const isDark = this.themeService.isDark();
      this.lineChartOptions = this.getChartOptions(isDark);
    });
  }

  currency = computed(() => this.workspaceContext.currency);

  data = signal<DashboardData | null>(null);
  loading = signal(true);
  today = new Date();

  get todayDateString(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  currentPeriod = signal<'7D' | '30D' | '90D'>('7D');
  chartTotal = 0;
  chartPercentage = 0;
  chartHasComparison = false;
  profitTotal = 0;
  topProductsMax = computed(() => {
    const products = this.data()?.topProducts ?? [];
    return products.length > 0 ? products[0].totalSold : 1;
  });

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
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

  public lineChartOptions: ChartOptions<'line'> = {};

  getChartOptions(isDark: boolean): ChartOptions<'line'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' },
          border: { display: false },
          ticks: { color: isDark ? '#94a3b8' : '#64748b' }
        },
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: isDark ? '#94a3b8' : '#64748b' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.9)',
          titleColor: isDark ? '#f1f5f9' : '#1e293b',
          bodyColor: isDark ? '#cbd5e1' : '#475569',
          borderColor: isDark ? '#334155' : '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
        }
      }
    };
  }

  readonly alerts = computed(() => this.data()?.alerts ?? {
    lowStock: 0,
    noPrice: 0,
    noSales30Days: 0
  });

  updateChartData() {
    const period = this.currentPeriod();
    const dashboardData = this.data();
    const sales = dashboardData?.salesForChart || [];

    const now = new Date();
    let days = 7;
    if (period === '30D') days = 30;
    if (period === '90D') days = 90;

    const labels: string[] = [];
    const data: number[] = [];
    const profitData: number[] = [];
    const dailyTotals: { [key: string]: number } = {};
    const dailyProfits: { [key: string]: number } = {};

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateString = d.toISOString().split('T')[0];

      let label = '';
      if (days === 7) {
        label = d.toLocaleDateString(this.locale || 'es-ES', { weekday: 'short' });
        label = label.charAt(0).toUpperCase() + label.slice(1);
      } else {
        label = d.toLocaleDateString(this.locale || 'es-ES', { day: '2-digit', month: '2-digit' });
      }

      labels.push(label);
      dailyTotals[dateString] = 0;
      dailyProfits[dateString] = 0;
    }

    sales.forEach(sale => {
      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
      if (dailyTotals[saleDate] !== undefined) {
        dailyTotals[saleDate] += sale.totalAmount;
        dailyProfits[saleDate] += (sale.grossProfit ?? 0);
      }
    });

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      data.push(dailyTotals[dateString]);
      profitData.push(dailyProfits[dateString]);
    }

    this.chartTotal = data.reduce((sum, val) => sum + val, 0);
    this.profitTotal = profitData.reduce((sum, val) => sum + val, 0);

    let currentTotal = 0;
    let previousTotal = 0;

    const currentStart = new Date(now);
    currentStart.setDate(now.getDate() - days);

    const previousStart = new Date(now);
    previousStart.setDate(now.getDate() - (days * 2));

    sales.forEach(sale => {
      const saleDate = new Date(sale.createdAt);
      if (saleDate >= currentStart && saleDate <= now) {
        currentTotal += sale.totalAmount;
      } else if (saleDate >= previousStart && saleDate < currentStart) {
        previousTotal += sale.totalAmount;
      }
    });

    if (previousTotal === 0) {
      this.chartPercentage = 0;
      this.chartHasComparison = false;
    } else {
      this.chartPercentage = ((currentTotal - previousTotal) / previousTotal) * 100;
      this.chartHasComparison = true;
    }

    this.lineChartData = {
      labels,
      datasets: [
        {
          data,
          label: 'Ingresos',
          fill: true,
          tension: 0.4,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: '#8b5cf6',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#8b5cf6',
          pointRadius: days <= 7 ? 4 : 2,
          pointHoverRadius: days <= 7 ? 6 : 4,
        },
        {
          data: profitData,
          label: 'Ganancia bruta',
          fill: false,
          tension: 0.4,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          borderWidth: 2,
          borderDash: [6, 3],
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#10b981',
          pointRadius: days <= 7 ? 3 : 2,
          pointHoverRadius: days <= 7 ? 5 : 3,
        },
      ]
    };
  }

  setPeriod(period: '7D' | '30D' | '90D') {
    this.currentPeriod.set(period);
    this.updateChartData();
  }

  ngOnInit() {
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        this.data.set(res);
        this.updateChartData();
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