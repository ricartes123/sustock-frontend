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
  private apiUrl = environment.apiUrl;

  getDashboard() {
    return this.http.get<DashboardData>(
      `${this.apiUrl}/dashboard`
    );
  }
}