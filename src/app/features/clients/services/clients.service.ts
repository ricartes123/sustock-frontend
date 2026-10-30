import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Client, CreateClientDto, UpdateClientDto } from '../../../core/models/client.model';
import { Sale } from '../../../core/models/sale.model';
import { PaginationMeta } from '../../../core/models/pagination-meta.model';

export interface ClientSalesPage extends PaginationMeta<Sale> {
    meta: PaginationMeta<Sale>['meta'] & { totalAmount: number; averageTicket: number };
}

@Injectable({
    providedIn: 'root'
})
export class ClientsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/clients`;

    create(data: CreateClientDto): Observable<Client> {
        return this.http.post<Client>(this.apiUrl, data);
    }

    findAll(page: number = 1, limit: number = 10, search?: string, status: string = 'ACTIVE'): Observable<PaginationMeta<Client>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString())
            .set('status', status);

        if (search) {
            params = params.set('search', search);
        }

        return this.http.get<PaginationMeta<Client>>(this.apiUrl, { params });
    }

    findOne(id: string): Observable<Client> {
        return this.http.get<Client>(`${this.apiUrl}/${id}`);
    }

    update(id: string, data: UpdateClientDto): Observable<Client> {
        return this.http.patch<Client>(`${this.apiUrl}/${id}`, data);
    }

    remove(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    restore(id: string): Observable<Client> {
        return this.http.post<Client>(`${this.apiUrl}/${id}/restore`, {});
    }

    getClientSales(clientId: string, page: number = 1, limit: number = 10): Observable<ClientSalesPage> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        return this.http.get<ClientSalesPage>(`${environment.apiUrl}/sales/${clientId}/sales`, { params });
    }
}
