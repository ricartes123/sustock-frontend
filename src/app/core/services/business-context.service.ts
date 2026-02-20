import { Injectable, signal } from '@angular/core';
import { Business } from '../../features/business/services/business.service';

@Injectable({ providedIn: 'root' })
export class BusinessContextService {

  private _businesses = signal<Business[]>([]);
  private _activeBusiness = signal<Business | null>(null);

  businesses = this._businesses.asReadonly();
  activeBusiness = this._activeBusiness.asReadonly();

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