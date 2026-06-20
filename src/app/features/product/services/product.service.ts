import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product } from '../../../core/models/product.model';
import { PaginationMeta } from '../../../core/models/pagination-meta.model';

export interface ImportResult {
  created: number;
  total: number;
  errors: { row: number; message: string }[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    getAll(page = 1, limit = 10, search = '', lowStock = false, status: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ACTIVE'): Observable<PaginationMeta<Product>> {
        let url = `${this.apiUrl}/products?page=${page}&limit=${limit}`;
        if (search) url += `&search=${search}`;
        if (lowStock) url += `&lowStock=true`;
        if (status !== 'ALL') url += `&status=${status}`;

        return this.http.get<PaginationMeta<Product>>(url);
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

    importProducts(file: File): Observable<ImportResult> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<ImportResult>(`${this.apiUrl}/products/import`, formData);
    }
}