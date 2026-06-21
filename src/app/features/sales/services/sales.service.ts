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

    findAll(
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: string,
        startDate?: string,
        endDate?: string,
        minAmount?: number,
        maxAmount?: number
    ): Observable<{ data: Sale[], meta: any }> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (status) {
            params = params.set('status', status);
        }
        if (search) {
            params = params.set('search', search);
        }
        if (startDate) {
            params = params.set('startDate', startDate);
        }
        if (endDate) {
            params = params.set('endDate', endDate);
        }
        if (minAmount !== undefined && minAmount !== null) {
            params = params.set('minAmount', minAmount.toString());
        }
        if (maxAmount !== undefined && maxAmount !== null) {
            params = params.set('maxAmount', maxAmount.toString());
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
