import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

    getAll(page = 1, limit = 10) {
        return this.http.get<{
            data: Product[];
            meta: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        }>(`http://localhost:3000/products?page=${page}&limit=${limit}`);
    }
}