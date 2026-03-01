import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md';

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

        // Size Classes
        const sizeClasses = {
            'sm': 'px-2 py-0.5 text-[10px]',
            'md': 'px-2.5 py-1 text-xs'
        }[this.size];

        // Variant Classes
        const variantClasses = {
            'success': 'bg-green-100 text-green-800',
            'warning': 'bg-yellow-100 text-yellow-800',
            'error': 'bg-red-100 text-red-800',
            'info': 'bg-blue-100 text-blue-800',
            'neutral': 'bg-slate-200 text-slate-600'
        }[this.variant];

        return `${baseClasses} ${sizeClasses} ${variantClasses}`;
    }
}
