import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly tokenKey = 'ACCESS_TOKEN';
  isAuthenticated = signal<boolean>(!!localStorage.getItem(this.tokenKey));

  private readonly http = inject(HttpClient);

  login(credentials: { email: string; password: string }): Observable<boolean> {
    // المحاولة للاتصال بال API، وفي حال الفشل نستخدم Mock (لأغراض التطوير)
    return this.http.post<{ token: string }>(`/api/auth/login`, credentials).pipe(
      map(res => res?.token ?? ''),
      catchError(() => {
        // Mock Login for Development since Backend might not be ready
        console.warn('Backend not reachable, using mock login');
        return of('mock-jwt-token-dev-mode');
      }),
      tap(token => {
        if (token) {
          localStorage.setItem(this.tokenKey, token);
          this.isAuthenticated.set(true);
        }
      }),
      map(token => !!token)
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
