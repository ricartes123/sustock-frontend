import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon' | 'icon-primary' | 'icon-danger';
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

    get classes(): string {
        const baseClasses = 'cursor-pointer inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

        const isIconVariant = this.variant.startsWith('icon');
        const sizeClasses = isIconVariant ? 'p-1.5 rounded-lg' : {
            'sm': 'px-3 py-1.5 text-sm rounded-md',
            'md': 'px-4 py-2 text-sm rounded-lg',
            'lg': 'px-5 py-2.5 text-base rounded-lg'
        }[this.size];

        const variantClasses = {
            'primary': 'cursor-pointer bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm',
            'secondary': 'cursor-pointer bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-slate-500 shadow-sm border border-slate-300 dark:border-slate-600',
            'danger': 'cursor-pointer bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm border border-transparent',
            'ghost': 'cursor-pointer bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-500 border border-transparent',
            'icon': 'cursor-pointer bg-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-slate-500 border border-transparent',
            'icon-primary': 'cursor-pointer bg-transparent text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:ring-blue-500 border border-transparent',
            'icon-danger': 'cursor-pointer bg-transparent text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 focus:ring-red-500 border border-transparent'
        }[this.variant];

        const disabledClasses = this.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

        return `${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${this.class}`;
    }
}
