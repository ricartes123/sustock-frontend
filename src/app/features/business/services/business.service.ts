import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface Business {
  id: string;
  name: string;
  currency: string;
}

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll() {
    return this.http.get<Business[]>(
      `${this.apiUrl}/businesses`
    );
  }
}