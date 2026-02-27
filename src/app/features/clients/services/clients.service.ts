import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

export interface CreateClientDto {
    name: string;
    phone?: string;
    email?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ClientsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/clients`;

    create(data: CreateClientDto): Observable<any> {
        return this.http.post(this.apiUrl, data);
    }

    findAll(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    findOne(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }
}
