import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product } from '../../../core/models/product.model';
import { PaginationMeta } from '../../../core/models/pagination-meta.model';

export type ProductStatusFilter = 'ALL' | 'ACTIVE' | 'ARCHIVED';

export interface ImportResult {
  created: number;
  total: number;
  errors: { row: number; message: string }[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    getAll(page = 1, limit = 10, search = '', lowStock = false, status: ProductStatusFilter = 'ACTIVE'): Observable<PaginationMeta<Product>> {
        let params = new HttpParams()
            .set('page', page)
            .set('limit', limit)
            .set('status', status);
        if (search) params = params.set('search', search);
        if (lowStock) params = params.set('lowStock', 'true');

        return this.http.get<PaginationMeta<Product>>(`${this.apiUrl}/products`, { params });
    }

    create(product: Partial<Product>): Observable<Product> {
        return this.http.post<Product>(`${this.apiUrl}/products`, product);
    }

    update(id: string, product: Partial<Product>): Observable<Product> {
        return this.http.patch<Product>(`${this.apiUrl}/products/${id}`, product);
    }

    toggleStatus(id: string, active: boolean): Observable<Product> {
        return active
            ? this.http.post<Product>(`${this.apiUrl}/products/${id}/restore`, {})
            : this.http.patch<Product>(`${this.apiUrl}/products/${id}`, { isActive: false });
    }

    importProducts(file: File): Observable<ImportResult> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<ImportResult>(`${this.apiUrl}/products/import`, formData);
    }
}