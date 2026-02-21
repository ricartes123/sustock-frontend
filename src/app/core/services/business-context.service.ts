import { Injectable, signal, inject, computed } from '@angular/core';
import { Business } from '../../features/business/services/business.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class BusinessContextService {
  private authService = inject(AuthService);

  private _businesses = signal<Business[]>([]);
  private _activeBusiness = signal<Business | null>(null);

  businesses = this._businesses.asReadonly();
  activeBusiness = this._activeBusiness.asReadonly();

  isAdmin = computed(() => {
    const user = this.authService.user();
    const active = this._activeBusiness();

    if (!user || !active) return false;

    // Si el ID del negocio activo está en la lista de negocios propios del usuario, es admin.
    return user.businesses.some(b => b.id === active.id);
  });

  initialize(businesses: Business[]) {
    this._businesses.set(businesses);

    const savedId = localStorage.getItem('activeBusinessId');
    const found = businesses.find(b => b.id === savedId);

    this._activeBusiness.set(found ?? businesses[0] ?? null);

    if (this._activeBusiness()) {
      localStorage.setItem(
        'activeBusinessId',
        this._activeBusiness()!.id
      );
    }
  }

  setActiveBusiness(business: Business) {
    this._activeBusiness.set(business);
    localStorage.setItem('activeBusinessId', business.id);
  }

  get currency() {
    return this._activeBusiness()?.currency ?? 'USD';
  }

  get currencySymbol(): string {
    switch (this.currency) {
      case 'EUR': return '€';
      case 'BRL': return 'R$';
      default: return '$';
    }
  }

  get locale(): string {
    switch (this.currency) {
      case 'USD': return 'es-AR';
      case 'EUR': return 'de-DE';
      case 'CLP': return 'es-CL';
      case 'BRL': return 'pt-BR';
      case 'MXN': return 'es-MX';
      case 'ARS': return 'es-AR';
      default: return 'es-AR';
    }
  }
}