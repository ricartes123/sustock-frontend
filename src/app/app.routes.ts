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
                data: { title: 'SIDEBAR.DASHBOARD' }
            },
            {
                path: 'products',
                loadComponent: () =>
                    import('./features/product/pages/products/products')
                        .then(m => m.Products),
                data: { title: 'SIDEBAR.PRODUCTS' }
            },
            {
                path: 'movements',
                loadComponent: () =>
                    import('./features/movement/pages/movements/movements')
                        .then(m => m.Movements),
                data: { title: 'SIDEBAR.MOVEMENTS' }
            },
            {
                path: 'movements/new',
                loadComponent: () =>
                    import('./features/movement/pages/movement-create/movement-create')
                        .then(m => m.MovementCreate),
                data: { title: 'SIDEBAR.NEW_MOVEMENT' }
            },
            {
                path: 'settings',
                loadComponent: () =>
                    import('./features/workspace/pages/settings/settings')
                        .then(m => m.Settings),
                data: { title: 'SIDEBAR.SETTINGS' }
            },
            {
                path: 'sales',
                loadComponent: () =>
                    import('./features/sales/pages/sales/sales')
                        .then(m => m.Sales),
                data: { title: 'SIDEBAR.SALES' }
            },
            {
                path: 'sales/new',
                loadComponent: () =>
                    import('./features/sales/pages/sale-create/sale-create')
                        .then(m => m.SaleCreate),
                data: { title: 'SIDEBAR.NEW_SALE' }
            },
        ],
    },
];