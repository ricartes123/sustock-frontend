import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Sale, CreateSaleDto } from '../../../core/models/sale.model';
import { PaginationMeta } from '../../../core/models/pagination-meta.model';

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
    ): Observable<PaginationMeta<Sale>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (status) {
            params = params.set('status', status);
        }
        if (search) {
            params = params.set('search', search);
        }
        // Dates come as local YYYY-MM-DD; send the local day boundaries as instants
        if (startDate) {
            params = params.set('startDate', new Date(`${startDate}T00:00:00`).toISOString());
        }
        if (endDate) {
            params = params.set('endDate', new Date(`${endDate}T23:59:59.999`).toISOString());
        }
        if (minAmount !== undefined && minAmount !== null) {
            params = params.set('minAmount', minAmount.toString());
        }
        if (maxAmount !== undefined && maxAmount !== null) {
            params = params.set('maxAmount', maxAmount.toString());
        }

        return this.http.get<PaginationMeta<Sale>>(this.apiUrl, { params });
    }

    findOne(id: string): Observable<Sale> {
        return this.http.get<Sale>(`${this.apiUrl}/${id}`);
    }

    remove(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
