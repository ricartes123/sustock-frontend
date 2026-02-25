import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
      'http://localhost:3000/workspaces'
    );
  }

  updateCurrency(id: string, newCurrency: string, conversionRate?: number) {
    return this.http.patch<Workspace>(
      `http://localhost:3000/workspaces/${id}/currency`,
      { newCurrency, conversionRate }
    );
  }
}