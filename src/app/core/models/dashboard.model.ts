import { Sale } from './sale.model';
import { Movement } from './movement.model';
import { Product } from './product.model';

export interface DashboardTopProduct {
  id: string;
  name: string;
  totalSold: number;
}

export interface DashboardData {
  totalProducts: number;
  totalStockValue: number;
  currency: string;
  salesToday?: number;
  salesTodayCount?: number;
  lowStockCount: number;
  monthlyMovements?: number;
  recentSales?: Sale[];
  recentMovements?: Movement[];
  topProducts?: DashboardTopProduct[];
  lowStockProducts?: Product[];
  alerts?: {
    lowStock: number;
    noPrice: number;
    noSales30Days: number;
  };
}
