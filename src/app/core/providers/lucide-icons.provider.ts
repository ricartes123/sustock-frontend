import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import {
    LucideAngularModule,
    Box,
    LayoutDashboard,
    ShoppingCart,
    ArrowRightLeft,
    FileText,
    Wallet,
    Receipt,
    Settings,
    Moon,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Package2
} from 'lucide-angular';

export function provideLucideIcons(): EnvironmentProviders {
    return importProvidersFrom(
        LucideAngularModule.pick({
            Box,
            LayoutDashboard,
            ShoppingCart,
            ArrowRightLeft,
            FileText,
            Wallet,
            Receipt,
            Settings,
            Moon,
            LogOut,
            ChevronLeft,
            ChevronRight,
            Package2
        })
    );
}
