import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Skip loading for specific requests if needed (e.g. background polling)
  if (req.headers.has('X-Skip-Loader')) {
    return next(req);
  }

  loadingService.setLoading(true, req.url);

  return next(req).pipe(
    finalize(() => {
      loadingService.setLoading(false, req.url);
    })
  );
};
