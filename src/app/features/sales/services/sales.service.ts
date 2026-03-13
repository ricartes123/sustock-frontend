import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

    findAll(): Observable<Sale[]> {
        return this.http.get<Sale[]>(this.apiUrl);
    }

    findOne(id: string): Observable<Sale> {
        return this.http.get<Sale>(`${this.apiUrl}/${id}`);
    }

    remove(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
