import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';
import { WorkspaceService } from '../../services/workspace.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HotToastService } from '@ngxpert/hot-toast';
import { LanguageService } from '../../../../core/services/language.service';
import { LucideAngularModule } from 'lucide-angular';

interface ExchangeRateResponse {
    rates: Record<string, number>;
}

@Component({
    standalone: true,
    selector: 'app-settings',
    imports: [FormsModule, CommonModule, TranslateModule, LucideAngularModule],
    templateUrl: './settings.html'
})
export class Settings implements OnInit {
    workspaceContext = inject(WorkspaceContextService);
    workspaceService = inject(WorkspaceService);
    authService = inject(AuthService);
    http = inject(HttpClient);
    toast = inject(HotToastService);
    translate = inject(TranslateService);
    languageService = inject(LanguageService);

    selectedCurrency = 'ARS';
    selectedLanguage = 'es';
    showConversionModal = signal(false);

    conversionMode = signal<'NONE' | 'MANUAL' | 'AUTO'>('NONE');
    manualRate = signal<number | null>(null);

    loading = signal(false);
    apiRate = signal<number | null>(null);
    apiError = signal<string | null>(null);

    ngOnInit() {
        const active = this.workspaceContext.activeWorkspace();
        if (active) {
            this.selectedCurrency = active.currency;
        }
        this.selectedLanguage = this.languageService.currentLanguage;
    }

    get hasCurrencyChanged() {
        return this.selectedCurrency !== this.workspaceContext.activeWorkspace()?.currency;
    }

    get hasLanguageChanged() {
        return this.selectedLanguage !== this.languageService.currentLanguage;
    }

    get hasChanges() {
        return this.hasCurrencyChanged || this.hasLanguageChanged;
    }

    onSaveInitiated() {
        if (!this.hasChanges) return;

        if (this.hasCurrencyChanged) {
            this.showConversionModal.set(true);
            // Si cambian a auto, reseteamos el request
            this.conversionMode.set('NONE');
            this.apiRate.set(null);
        } else {
            this.saveOnlyLanguage();
        }
    }

    saveOnlyLanguage() {
        this.languageService.setLanguage(this.selectedLanguage as 'es' | 'en');
        this.toast.success(this.translate.instant('TOAST.CONFIG_SAVED'));
    }

    setMode(mode: 'NONE' | 'MANUAL' | 'AUTO') {
        this.conversionMode.set(mode);
        if (mode === 'AUTO' && !this.apiRate()) {
            this.fetchLiveRate();
        }
    }

    fetchLiveRate() {
        this.apiError.set(null);
        this.apiRate.set(null);
        this.loading.set(true);

        const oldCurr = this.workspaceContext.activeWorkspace()?.currency || 'ARS';
        const newCurr = this.selectedCurrency;

        this.http.get<ExchangeRateResponse>(`https://api.exchangerate-api.com/v4/latest/${oldCurr}`).subscribe({
            next: (res) => {
                const rate = res.rates[newCurr];
                if (rate) {
                    this.apiRate.set(rate);
                } else {
                    this.apiError.set(this.translate.instant('TOAST.NO_EXCHANGE_RATE'));
                }
                this.loading.set(false);
            },
            error: () => {
                this.apiError.set(this.translate.instant('TOAST.EXCHANGE_API_ERROR'));
                this.loading.set(false);
            }
        });
    }

    confirmUpdate() {
        let finalRate: number | undefined;

        if (this.conversionMode() === 'MANUAL') {
            if (!this.manualRate() || this.manualRate()! <= 0) {
                this.toast.error(this.translate.instant('TOAST.INVALID_MULTIPLIER'));
                return;
            }
            finalRate = this.manualRate()!;
        } else if (this.conversionMode() === 'AUTO') {
            if (!this.apiRate()) {
                this.toast.error(this.translate.instant('TOAST.EXCHANGE_NOT_LOADED'));
                return;
            }
            finalRate = this.apiRate()!;
        }

        const bId = this.workspaceContext.activeWorkspace()!.id;
        this.loading.set(true);

        this.workspaceService.updateCurrency(bId, this.selectedCurrency, finalRate).subscribe({
            next: () => {
                if (this.hasLanguageChanged) {
                    this.languageService.setLanguage(this.selectedLanguage as 'es' | 'en');
                }
                // En vez de reload, actualizamos el perfil
                this.authService.fetchProfile().subscribe({
                    next: (user) => {
                        this.authService.setUser(user);
                        this.workspaceService.getAll().subscribe({
                            next: (workspaces) => {
                                this.workspaceContext.initialize(workspaces);
                                this.showConversionModal.set(false);
                                this.loading.set(false);
                                this.toast.success(this.translate.instant('TOAST.CONFIG_SAVED'));
                                window.location.reload(); // Quick refresh to ensure UI takes the new symbols via CurrencyPipe everywhere
                            },
                            error: () => {
                                this.loading.set(false);
                                this.toast.error(this.translate.instant('TOAST.CURRENCY_UPDATE_ERROR'));
                            }
                        });
                    },
                    error: () => {
                        this.loading.set(false);
                        this.toast.error(this.translate.instant('TOAST.CURRENCY_UPDATE_ERROR'));
                    }
                });
            },
            error: (err) => {
                console.error(err);
                this.loading.set(false);
                this.toast.error(err.error?.message || this.translate.instant('TOAST.CURRENCY_UPDATE_ERROR'));
            }
        });
    }
}
