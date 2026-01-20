import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth-interceptor';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpJsonLoader } from './core/i18n/loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(
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
  ]
};
