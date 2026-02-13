import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const injector = inject(Injector);
  const router = inject(Router);

  // Skip translation files to avoid circular dependency loops
  if (req.url.includes('/assets/i18n/')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Lazy load TranslateService to avoid circular dependency
      const translate = injector.get(TranslateService);
      
      let errorMessage = translate.instant('errors.unknown');

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = translate.instant('errors.network', { message: error.error.message });
      } else {
        const backend = error.error as unknown;
        const backendRecord = backend && typeof backend === 'object' ? (backend as Record<string, unknown>) : null;
        const backendMessage =
          backendRecord && typeof backendRecord['message'] === 'string'
            ? String(backendRecord['message'])
            : null;

        const backendErrorsValue = backendRecord ? backendRecord['errors'] : null;
        const backendErrors = Array.isArray(backendErrorsValue)
          ? (backendErrorsValue as unknown[])
              .filter((e: unknown): e is string => typeof e === 'string' && e.trim().length > 0)
              .join('\n')
          : null;

        const backendDetail = [backendMessage, backendErrors].filter(Boolean).join('\n') || null;

        // Backend returned an unsuccessful response code
        // The response body may contain clues as to what went wrong
        if (error.status === 401) {
            errorMessage = translate.instant('errors.unauthorized');
        } else if (error.status === 403) {
            errorMessage = translate.instant('errors.forbidden');
            router.navigate(['/access-denied']);
        } else if (error.status === 404) {
            errorMessage = translate.instant('errors.notFound');
            router.navigate(['/not-found']);
        } else if (error.status >= 500) {
            errorMessage = translate.instant('errors.server');
        } else {
            errorMessage = backendDetail ?? translate.instant('errors.code', { status: error.status, message: error.message });
        }
      }

      messageService.add({
        severity: 'error',
        summary: translate.instant('errors.title'),
        detail: errorMessage,
        life: 5000
      });

      // Return an observable with a user-facing error message
      return throwError(() => new Error(errorMessage));
    })
  );
};
