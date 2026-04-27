import { Routes } from '@angular/router';
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
        loadComponent: () =>
            import('./layout/dashboard-layout/dashboard-layout')
                .then(m => m.DashboardLayout),
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
            {
                path: 'clients',
                loadComponent: () =>
                    import('./features/clients/pages/clients/clients')
                        .then(m => m.ClientsComponent),
                data: { title: 'SIDEBAR.CLIENTS' }
            },
        ],
    },
];