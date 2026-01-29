import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom, ErrorHandler } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth-interceptor';
import { httpErrorInterceptor } from './core/errors/http-error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { GlobalErrorHandler } from './core/errors/global-error-handler';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpJsonLoader } from './core/i18n/loader';
import { MessageService } from 'primeng/api';
import { NgxSpinnerModule } from 'ngx-spinner';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor, httpErrorInterceptor])),
    importProvidersFrom(
      NgxSpinnerModule.forRoot({ type: 'ball-beat' }),
      TranslateModule.forRoot({
        fallbackLang: 'ar',
        loader: {
          provide: TranslateLoader,
          useClass: HttpJsonLoader
        }
      })
    ),
    providePrimeNG({
      ripple: true,
      inputVariant: 'filled',
      theme: {
        preset: Aura
      }
    }),
    MessageService,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ]
};
