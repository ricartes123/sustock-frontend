import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/pages/login/login')
                .then(m => m.Login),
    },
    {
        path: '',
        component: DashboardLayoutComponent,
        canActivate: [authGuard],
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
                    import('./features/product/pages/products/products')
                        .then(m => m.Products),
            },
            {
                path: 'movements',
                loadComponent: () =>
                    import('./features/movement/pages/movements/movements')
                        .then(m => m.Movements),
            },
        ],
    },
];