import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly tokenKey = 'ACCESS_TOKEN';
  isAuthenticated = signal<boolean>(!!localStorage.getItem(this.tokenKey));

  private readonly http = inject(HttpClient);

  login(credentials: { email: string; password: string }) {
    // TODO: استبدال بمحرك API حقيقي
    return this.http.post<{ token: string }>(`/api/auth/login`, credentials).pipe(
      map(res => res?.token ?? ''),
      tap(token => {
        if (token) {
          localStorage.setItem(this.tokenKey, token);
          this.isAuthenticated.set(true);
        }
      })
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
