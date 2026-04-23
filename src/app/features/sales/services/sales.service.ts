import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Sale, CreateSaleDto } from '../../../core/models/sale.model';

@Injectable({
    providedIn: 'root'
})
export class SalesService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/sales`;

    create(data: CreateSaleDto): Observable<Sale> {
        return this.http.post<Sale>(this.apiUrl, data);
    }

    findAll(page: number = 1, limit: number = 10, search?: string, status: string = 'ACTIVE'): Observable<{ data: Sale[], meta: any }> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString())
            .set('status', status);

        if (search) {
            params = params.set('search', search);
        }

        return this.http.get<{ data: Sale[], meta: any }>(this.apiUrl, { params });
    }

    findOne(id: string): Observable<Sale> {
        return this.http.get<Sale>(`${this.apiUrl}/${id}`);
    }

    remove(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
