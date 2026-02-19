import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface LoginDto {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _token = signal<string | null>(localStorage.getItem('token'));
  token = this._token.asReadonly();

  login(dto: LoginDto) {
    return this.http.post<LoginResponse>(
      'http://localhost:3000/auth/login',
      dto
    );
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
    this._token.set(token);
  }

  logout() {
    localStorage.removeItem('token');
    this._token.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated() {
    return !!this._token();
  }
}