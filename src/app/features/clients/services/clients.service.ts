import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Client, CreateClientDto } from '../../../core/models/client.model';

@Injectable({
    providedIn: 'root'
})
export class ClientsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/clients`;

    create(data: CreateClientDto): Observable<Client> {
        return this.http.post<Client>(this.apiUrl, data);
    }

    findAll(): Observable<Client[]> {
        return this.http.get<Client[]>(this.apiUrl);
    }

    findOne(id: string): Observable<Client> {
        return this.http.get<Client>(`${this.apiUrl}/${id}`);
    }
}
