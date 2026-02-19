import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface DashboardData {
  totalProducts: number;
  totalStockValue: number;
  lowStockCount: number;
  totalMovements: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  getDashboard() {
    return this.http.get<DashboardData>(
      'http://localhost:3000/dashboard'
    );
  }
}