import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponseData, User } from '../models/auth.model';
import { ApiResponse } from '../models/common.model';
import { CryptoService } from '../services/crypto.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly tokenKey = 'ACCESS_TOKEN';
  private readonly userKey = 'USER_DATA';
  
  private readonly http = inject(HttpClient);
  private readonly crypto = inject(CryptoService);

  currentUser = signal<User | null>(this.getUserFromStorage());
  isAuthenticated = signal<boolean>(!!this.currentUser());

  login(credentials: LoginRequest): Observable<boolean> {
    return this.http.post<ApiResponse<LoginResponseData>>(`${environment.apiUrl}/Account/Login`, credentials).pipe(
      map((response) => {
        const userData = response?.data;
        if (response?.succeeded && userData?.token) {
          const user: User = {
            id: userData.id,
            fullName: userData.fullName,
            email: userData.email,
            token: userData.token,
          };
          this.saveSession(user);
          return true;
        }
        return false;
      }),
      catchError((error) => {
        console.error('Login failed with backend:', error);
        return of(false);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    const encryptedToken = localStorage.getItem(this.tokenKey);
    return encryptedToken ? this.crypto.decrypt(encryptedToken) : null;
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    return user?.permissions?.includes(permission) ?? false;
  }

  private saveSession(user: User) {
    try {
      if (user.token) {
        const decodedToken = jwtDecode<Record<string, unknown>>(user.token);

        const permissionClaim = decodedToken['Permission'];
        if (permissionClaim) {
          const permissions = Array.isArray(permissionClaim)
            ? permissionClaim.filter((p): p is string => typeof p === 'string')
            : typeof permissionClaim === 'string'
                ? [permissionClaim]
                : [];
          user.permissions = permissions.length ? permissions : undefined;
        }
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }

    const encryptedToken = this.crypto.encrypt(user.token);
    const encryptedUser = this.crypto.encrypt(JSON.stringify(user));

    localStorage.setItem(this.tokenKey, encryptedToken);
    localStorage.setItem(this.userKey, encryptedUser);
    
    this.isAuthenticated.set(true);
    this.currentUser.set(user);
  }

  private getUserFromStorage(): User | null {
    const encryptedUser = localStorage.getItem(this.userKey);
    if (!encryptedUser) return null;
    
    try {
      const decryptedUserStr = this.crypto.decrypt(encryptedUser);
      return decryptedUserStr ? JSON.parse(decryptedUserStr) : null;
    } catch (e) {
      console.error('Failed to parse user from storage', e);
      return null;
    }
  }
}
