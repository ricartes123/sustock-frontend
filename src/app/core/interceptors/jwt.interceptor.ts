import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { WorkspaceContextService } from '../services/workspace-context.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');
  const workspaceContext = inject(WorkspaceContextService);

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

  return next(req);
};