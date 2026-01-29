import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginRequest } from '../models/auth.model';
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

  // Initialize signals with decrypted data
  currentUser = signal<User | null>(this.getUserFromStorage());
  isAuthenticated = signal<boolean>(!!this.currentUser());

  login(credentials: LoginRequest): Observable<boolean> {
    return this.http.post<User>(`${environment.apiUrl}/Account/Login`, credentials).pipe(
      map(user => {
        if (user && user.token) {
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
    // Decode token to view claims/permissions in console
    try {
      if (user.token) {
        const decodedToken: any = jwtDecode(user.token);
        console.group('🔐 Decoded JWT Token');
        console.log('Raw Token:', user.token);
        console.log('Decoded Claims:', decodedToken);
        console.groupEnd();

        // Extract permissions from token
        if (decodedToken && decodedToken.Permission) {
          // Ensure it's an array (it might be a single string if only one permission)
          const permissions = Array.isArray(decodedToken.Permission) 
            ? decodedToken.Permission 
            : [decodedToken.Permission];
          
          user.permissions = permissions;
        }
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }

    // Encrypt token and user data before storing
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
