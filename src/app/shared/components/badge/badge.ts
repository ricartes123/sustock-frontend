import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
    selector: 'app-badge',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './badge.html',
})
export class Badge {
    @Input() variant: BadgeVariant = 'neutral';
    @Input() size: BadgeSize = 'sm';

    get classes(): string {
        const baseClasses = 'inline-flex font-semibold rounded-full items-center justify-center';

        const sizeClasses = {
            'sm': 'px-2 py-0.5 text-[10px]',
            'md': 'px-2.5 py-1 text-xs',
            'lg': 'px-3 py-1.5 text-sm'
        }[this.size];

        const variantClasses = {
            'success': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
            'warning': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400',
            'error': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
            'info': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
            'neutral': 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
        }[this.variant];

        return `${baseClasses} ${sizeClasses} ${variantClasses}`;
    }
}
