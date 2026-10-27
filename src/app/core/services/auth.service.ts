import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends LoginDto {
  firstName: string;
  lastName: string;
  workspaceName: string;
  currency?: string;
}

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'STAFF';

interface WorkspaceSummary {
  id: string;
  name: string;
  currency: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  workspaces: WorkspaceSummary[];
  teamMemberships: { role: WorkspaceRole; workspace: WorkspaceSummary }[];
}

// The session lives in an httpOnly cookie; the loaded profile is the client-side session state.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<User | null>(null);
  user = this._user.asReadonly();
  isAuthenticated = computed(() => this._user() !== null);

  login(dto: LoginDto) {
    return this.http
      .post<User>(`${environment.apiUrl}/auth/login`, dto)
      .pipe(tap((user) => this._user.set(user)));
  }

  register(dto: RegisterDto) {
    return this.http
      .post<User>(`${environment.apiUrl}/auth/register`, dto)
      .pipe(tap((user) => this._user.set(user)));
  }

  restoreSession() {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`).pipe(
      tap((user) => this._user.set(user)),
      catchError(() => of(null))
    );
  }

  logout() {
    this.http.post<void>(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  clearSession() {
    this._user.set(null);
    this.router.navigate(['/login']);
  }
}
