import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

export interface SaleItemDto {
    productId: string;
    quantity: number;
}

export interface CreateSaleDto {
    clientId?: string;
    items: SaleItemDto[];
}

@Injectable({
    providedIn: 'root'
})
export class SalesService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/sales`;

    create(data: CreateSaleDto): Observable<any> {
        return this.http.post(this.apiUrl, data);
    }

    findAll(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    findOne(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }
}
