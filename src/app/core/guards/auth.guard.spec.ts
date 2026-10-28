import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  const isAuthenticated = signal(false);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated } },
      ],
    });
  });

  const run = () => TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

  it('redirects to /login without a loaded session', () => {
    isAuthenticated.set(false);
    const result = run() as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login');
  });

  it('allows navigation with a loaded session', () => {
    isAuthenticated.set(true);
    expect(run()).toBe(true);
  });
});
