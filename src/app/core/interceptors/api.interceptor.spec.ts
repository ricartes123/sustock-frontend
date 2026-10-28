import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { apiInterceptor } from './api.interceptor';
import { AuthService } from '../services/auth.service';
import { WorkspaceContextService } from '../services/workspace-context.service';

describe('apiInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  const clearSession = vi.fn();

  beforeEach(() => {
    clearSession.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { clearSession } },
        { provide: WorkspaceContextService, useValue: { activeWorkspace: signal({ id: 'w1', name: 'W', currency: 'ARS' }) } },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('adds x-workspace-id to API requests', () => {
    http.get('/api/products').subscribe();
    const req = backend.expectOne('/api/products');
    expect(req.request.headers.get('x-workspace-id')).toBe('w1');
    req.flush([]);
  });

  it('never sends our headers to third-party URLs', () => {
    http.get('https://api.exchangerate-api.com/v4/latest/ARS').subscribe();
    const req = backend.expectOne('https://api.exchangerate-api.com/v4/latest/ARS');
    expect(req.request.headers.has('x-workspace-id')).toBe(false);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('clears the session on 401 from regular endpoints', () => {
    http.get('/api/products').subscribe({ error: () => {} });
    backend.expectOne('/api/products').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(clearSession).toHaveBeenCalled();
  });

  it('lets auth endpoints report their own 401', () => {
    http.post('/api/auth/login', {}).subscribe({ error: () => {} });
    backend.expectOne('/api/auth/login').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(clearSession).not.toHaveBeenCalled();
  });
});
