import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

export interface CreateMovementDto {
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    quantity: number;
    reason?: string;
    productId: string;
}

@Injectable({
    providedIn: 'root'
})
export class MovementService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/movements`;

    create(data: CreateMovementDto): Observable<any> {
        return this.http.post(this.apiUrl, data);
    }

    findAll(page = 1, limit = 10, type?: string): Observable<any> {
        let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
        if (type) {
            url += `&type=${type}`;
        }
        return this.http.get<any>(url);
    }
}
