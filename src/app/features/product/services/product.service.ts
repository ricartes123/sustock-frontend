import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    getAll(page = 1, limit = 10) {
        return this.http.get<{
            data: Product[];
            meta: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        }>(`${this.apiUrl}/products?page=${page}&limit=${limit}`);
    }
}