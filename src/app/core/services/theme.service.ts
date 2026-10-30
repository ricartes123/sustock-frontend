import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly THEME_KEY = 'sustock_theme';
    private document = inject(DOCUMENT);

    isDark = signal<boolean>(false);

    constructor() {
        const saved = localStorage.getItem(this.THEME_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDark.set(saved !== null ? saved === 'dark' : prefersDark);

        effect(() => {
            if (this.isDark()) {
                this.document.documentElement.classList.add('dark');
            } else {
                this.document.documentElement.classList.remove('dark');
            }
            localStorage.setItem(this.THEME_KEY, this.isDark() ? 'dark' : 'light');
        });
    }

    private transitionTimeout: ReturnType<typeof setTimeout> | undefined;

    toggle() {
        if (this.transitionTimeout) {
            clearTimeout(this.transitionTimeout);
        }
        
        this.document.documentElement.classList.add('theme-transition');
        this.isDark.update(v => !v);
        
        this.transitionTimeout = setTimeout(() => {
            this.document.documentElement.classList.remove('theme-transition');
            this.transitionTimeout = undefined;
        }, 300);
    }
}
