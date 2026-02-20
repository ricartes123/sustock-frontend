import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BusinessContextService } from '../services/business-context.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');
  const businessContext = inject(BusinessContextService);

  const activeBusiness = businessContext.activeBusiness();

  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (activeBusiness) {
    headers['x-business-id'] = activeBusiness.id;
  }

  if (Object.keys(headers).length > 0) {
    req = req.clone({
      setHeaders: headers,
    });
  }

  return next(req);
};