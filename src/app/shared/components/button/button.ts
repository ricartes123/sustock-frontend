import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'icon' | 'icon-primary' | 'icon-success' | 'icon-danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
    selector: 'app-button',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './button.html',
})
export class Button {
    @Input() variant: ButtonVariant = 'primary';
    @Input() size: ButtonSize = 'md';
    @Input() disabled = false;
    @Input() type: 'button' | 'submit' | 'reset' = 'button';
    @Input() icon?: string;
    @Input() iconPosition: 'left' | 'right' = 'left';
    @Input() class: string = '';
    @Input() title?: string;
    @Input() ariaLabel?: string;

    get isIconOnly(): boolean {
        return this.variant.startsWith('icon');
    }

    // Icon-only buttons have no text, so their tooltip doubles as the accessible name.
    get accessibleName(): string | null {
        return this.ariaLabel ?? (this.isIconOnly ? this.title ?? null : null);
    }

    get classes(): string {
        const baseClasses = 'cursor-pointer inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2';

        const sizeClasses = this.isIconOnly ? 'p-1.5 rounded-lg' : {
            'sm': 'px-3 py-1.5 text-sm rounded-md',
            'md': 'px-4 py-2 text-sm rounded-lg',
            'lg': 'px-5 py-2.5 text-base rounded-lg'
        }[this.size];

        const variantClasses = {
            'primary':      'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/40 shadow-sm',
            'secondary':    'bg-card text-body hover:bg-card-hover focus:ring-primary-500/40 shadow-sm border border-medium',
            'danger':       'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/40 shadow-sm',
            'success':      'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500/40 shadow-sm',
            'ghost':        'bg-transparent text-muted hover:text-body hover:bg-card-hover focus:ring-primary-500/40',
            'icon':         'bg-transparent text-faint hover:text-body hover:bg-card-hover focus:ring-primary-500/40',
            'icon-primary': 'bg-transparent text-blue-500 hover:text-blue-600 hover:bg-card-hover focus:ring-blue-500/40',
            'icon-success': 'bg-transparent text-emerald-500 hover:text-emerald-600 hover:bg-card-hover focus:ring-emerald-500/40',
            'icon-danger':  'bg-transparent text-red-500 hover:text-red-600 hover:bg-card-hover focus:ring-red-500/40',
        }[this.variant];

        const disabledClasses = this.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

        return `${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${this.class}`;
    }
}
