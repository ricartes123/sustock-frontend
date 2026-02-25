import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface LoginDto {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
}

export interface RegisterDto extends LoginDto {
  firstName: string;
  lastName: string;
  workspaceName: string;
  currency?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  workspaces: { id: string; name: string; currency: string }[];
  teamMemberships: { workspace: { id: string; name: string; currency: string } }[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _token = signal<string | null>(localStorage.getItem('token'));
  token = this._token.asReadonly();

  private _user = signal<User | null>(null);
  user = this._user.asReadonly();

  login(dto: LoginDto) {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/login`,
      dto
    );
  }

  register(dto: RegisterDto) {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/register`,
      dto
    );
  }

  fetchProfile() {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`);
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
    this._token.set(token);
  }

  setUser(user: User) {
    this._user.set(user);
  }

  logout() {
    localStorage.removeItem('token');
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated() {
    return !!this._token();
  }
}