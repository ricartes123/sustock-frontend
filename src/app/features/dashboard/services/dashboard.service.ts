import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface DashboardData {
  totalProducts: number;
  totalStockValue: number;
  currency: string;
  lowStockCount: number;
  totalMovements: number;
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