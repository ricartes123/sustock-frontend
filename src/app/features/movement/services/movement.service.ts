import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Movement, CreateMovementDto } from '../../../core/models/movement.model';
import { PaginationMeta } from '../../../core/models/pagination-meta.model';

@Injectable({
    providedIn: 'root'
})
export class MovementService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/movements`;

    create(data: CreateMovementDto): Observable<Movement> {
        return this.http.post<Movement>(this.apiUrl, data);
    }

    getAll(page = 1, limit = 10, type?: string): Observable<PaginationMeta<Movement>> {
        let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
        if (type) {
            url += `&type=${type}`;
        }
        return this.http.get<PaginationMeta<Movement>>(url);
    }

    getProductMovements(productId: string, page = 1, limit = 10, type?: string): Observable<PaginationMeta<Movement>> {
        let url = `${this.apiUrl}/product/${productId}?page=${page}&limit=${limit}`;
        if (type) {
            url += `&type=${type}`;
        }
        return this.http.get<PaginationMeta<Movement>>(url);
    }
}
