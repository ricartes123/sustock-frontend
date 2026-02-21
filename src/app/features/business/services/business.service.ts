import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Business {
  id: string;
  name: string;
  currency: string;
}

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<Business[]>(
      'http://localhost:3000/businesses'
    );
  }

  updateCurrency(id: string, newCurrency: string, conversionRate?: number) {
    return this.http.patch<Business>(
      `http://localhost:3000/businesses/${id}/currency`,
      { newCurrency, conversionRate }
    );
  }
}