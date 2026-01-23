import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';

@Injectable()
export class HttpJsonLoader implements TranslateLoader {
  private readonly http = inject(HttpClient);
  getTranslation(lang: string): Observable<TranslationObject> {
    const path = `./assets/i18n/${lang}.json`;
    return this.http.get<TranslationObject>(path).pipe(
      tap(() => console.log(`Successfully loaded translation for ${lang} from ${path}`)),
      catchError(error => {
        console.error(`Error loading translation for ${lang} from ${path}`, error);
        return of({});
      })
    );
  }
}
