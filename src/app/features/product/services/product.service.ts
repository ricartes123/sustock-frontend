import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product, ProductPagedResult } from '../../../core/models/product.model';
import { Movement } from '../../../core/models/movement.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    getAll(page = 1, limit = 10, search = '', lowStock = false, status: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ACTIVE'): Observable<ProductPagedResult> {
        let url = `${this.apiUrl}/products?page=${page}&limit=${limit}`;
        if (search) url += `&search=${search}`;
        if (lowStock) url += `&lowStock=true`;
        if (status !== 'ALL') url += `&status=${status}`;

        return this.http.get<ProductPagedResult>(url);
    }

    create(product: Partial<Product>): Observable<Product> {
        return this.http.post<Product>(`${this.apiUrl}/products`, product);
    }

    update(id: string, product: Partial<Product>): Observable<Product> {
        return this.http.patch<Product>(`${this.apiUrl}/products/${id}`, product);
    }

    toggleStatus(id: string, active: boolean): Observable<Product> {
        return this.http.patch<Product>(`${this.apiUrl}/products/${id}`, { isActive: active });
    }

    getProductMovements(id: string): Observable<Movement[]> {
        return this.http.get<Movement[]>(`${this.apiUrl}/products/${id}/movements`);
    }
}