import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface Product {
    id: string;
    name: string;
    sku: string;
    barcode: string;
    price: number;
    stock: number;
    minStock: number;
    workspaceId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}


@Injectable({ providedIn: 'root' })
export class ProductService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000';

    getAll(page = 1, limit = 10, search = '', lowStock = false, status: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ACTIVE') {
        let url = `${this.apiUrl}/products?page=${page}&limit=${limit}`;
        if (search) url += `&search=${search}`;
        if (lowStock) url += `&lowStock=true`;
        if (status !== 'ALL') url += `&status=${status}`;

        return this.http.get<{
            data: Product[];
            meta: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        }>(url);
    }

    create(product: Partial<Product>) {
        return this.http.post<Product>(`${this.apiUrl}/products`, product);
    }

    update(id: string, product: Partial<Product>) {
        return this.http.patch<Product>(`${this.apiUrl}/products/${id}`, product);
    }

    toggleStatus(id: string, active: boolean) {
        // Asumiendo que el backend maneja PATCH para cambiar el isActive (soft-delete)
        return this.http.patch<Product>(`${this.apiUrl}/products/${id}`, { isActive: active });
    }
}