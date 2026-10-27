import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DashboardData } from '../../../core/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private http = inject(HttpClient);

    getDashboard(): Observable<DashboardData> {
        // "Today" and "this month" are computed server-side in the user's time zone
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return this.http.get<DashboardData>(
            `${environment.apiUrl}/dashboard`,
            { params: { tz } }
        );
    }
}