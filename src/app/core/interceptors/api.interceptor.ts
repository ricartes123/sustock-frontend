import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WorkspaceContextService } from '../services/workspace-context.service';
import { AuthService } from '../services/auth.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Third-party calls (e.g. exchange rates) must not receive our headers
  if (!req.url.startsWith(`${environment.apiUrl}/`)) {
    return next(req);
  }

  const workspaceContext = inject(WorkspaceContextService);
  const authService = inject(AuthService);

  const activeWorkspace = workspaceContext.activeWorkspace();

  if (activeWorkspace) {
    req = req.clone({ setHeaders: { 'x-workspace-id': activeWorkspace.id } });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Auth endpoints report their own 401s (wrong password, no session yet)
      if (error.status === 401 && !req.url.startsWith(`${environment.apiUrl}/auth/`)) {
        authService.clearSession();
      }
      return throwError(() => error);
    })
  );
};
