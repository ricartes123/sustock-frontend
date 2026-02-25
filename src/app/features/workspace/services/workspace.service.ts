import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface Workspace {
  id: string;
  name: string;
  currency: string;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<Workspace[]>(
      `${environment.apiUrl}/workspaces`
    );
  }

  updateCurrency(id: string, newCurrency: string, conversionRate?: number) {
    return this.http.patch<Workspace>(
      `${environment.apiUrl}/workspaces/${id}/currency`,
      { newCurrency, conversionRate }
    );
  }
}