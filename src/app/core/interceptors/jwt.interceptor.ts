import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { WorkspaceContextService } from '../services/workspace-context.service';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');
  const workspaceContext = inject(WorkspaceContextService);
  const authService = inject(AuthService);

  const activeWorkspace = workspaceContext.activeWorkspace();

  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (activeWorkspace) {
    headers['x-workspace-id'] = activeWorkspace.id;
  }

  if (Object.keys(headers).length > 0) {
    req = req.clone({
      setHeaders: headers,
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If unauthorized (e.g. token expired), log out the user automatically.
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};