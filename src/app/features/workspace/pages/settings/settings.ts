import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';
import { WorkspaceService } from '../../services/workspace.service';
import { HttpClient } from '@angular/common/http';
import { HotToastService } from '@ngxpert/hot-toast';
import { LucideAngularModule } from 'lucide-angular';

interface ExchangeRateResponse {
    rates: Record<string, number>;
}

@Component({
    standalone: true,
    selector: 'app-settings',
    imports: [FormsModule, CommonModule, LucideAngularModule],
    templateUrl: './settings.html'
})
export class Settings implements OnInit {
    workspaceContext = inject(WorkspaceContextService);
    workspaceService = inject(WorkspaceService);
    http = inject(HttpClient);
    toast = inject(HotToastService);

    selectedCurrency = 'ARS';
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
    }

    get hasCurrencyChanged() {
        return this.selectedCurrency !== this.workspaceContext.activeWorkspace()?.currency;
    }

    get hasChanges() {
        return this.workspaceContext.isOwner() && this.hasCurrencyChanged;
    }

    onSaveInitiated() {
        if (!this.hasChanges) return;
        this.showConversionModal.set(true);
        this.conversionMode.set('NONE');
        this.apiRate.set(null);
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
                    this.apiError.set('No hay tipo de cambio disponible para este par de monedas.');
                }
                this.loading.set(false);
            },
            error: () => {
                this.apiError.set('Error al conectar con la API de tipo de cambio.');
                this.loading.set(false);
            }
        });
    }

    confirmUpdate() {
        let finalRate: number | undefined;

        if (this.conversionMode() === 'MANUAL') {
            if (!this.manualRate() || this.manualRate()! <= 0) {
                this.toast.error('Por favor ingrese un multiplicador de conversión válido.');
                return;
            }
            finalRate = this.manualRate()!;
        } else if (this.conversionMode() === 'AUTO') {
            if (!this.apiRate()) {
                this.toast.error('El tipo de cambio aún no se ha cargado.');
                return;
            }
            finalRate = this.apiRate()!;
        }

        const workspace = this.workspaceContext.activeWorkspace();
        if (!workspace) {
            this.toast.error('No hay un espacio de trabajo activo.');
            return;
        }

        this.loading.set(true);

        this.workspaceService.updateCurrency(workspace.id, this.selectedCurrency, finalRate).subscribe({
            next: () => {
                // Reloading re-runs the session initializer, which refreshes profile and workspaces
                window.location.reload();
            },
            error: (err) => {
                console.error(err);
                this.loading.set(false);
                this.toast.error(err.error?.message || 'Error al actualizar moneda');
            }
        });
    }
}
