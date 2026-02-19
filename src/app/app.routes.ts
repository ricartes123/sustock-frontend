import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout';

export const routes: Routes = [
    {
        path: '',
        component: DashboardLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./features/dashboard/pages/dashboard/dashboard')
                        .then(m => m.Dashboard),
            },
            {
                path: 'products',
                loadComponent: () =>
                    import('./features/products/pages/products/products')
                        .then(m => m.Products),
            },
            {
                path: 'movements',
                loadComponent: () =>
                    import('./features/movements/pages/movements/movements')
                        .then(m => m.Movements),
            },
        ],
    },
];