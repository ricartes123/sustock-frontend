import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface DashboardData {
    totalProducts: number;
    totalStockValue: number;
    currency: string;
    salesToday?: number;
    salesTodayCount?: number;
    lowStockCount: number;
    monthlyMovements?: number;
    recentSales?: any[];
    recentMovements?: any[];
    topProducts?: any[];
    lowStockProducts?: any[];
    alerts?: {
        lowStock: number;
        noPrice: number;
        noSales30Days: number;
    };
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private http = inject(HttpClient);

    getDashboard() {
        return this.http.get<DashboardData>(
            `${environment.apiUrl}/dashboard`
        );
    }
}