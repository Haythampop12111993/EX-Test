import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, CreateRoleRequest, AssignRoleRequest } from '../models/role.model';
import { ApiResponse, unwrapApiResponse } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/roles`;

  getRoles(): Observable<Role[]> {
    return this.http.get<ApiResponse<Role[]> | Role[]>(this.apiUrl).pipe(
      map((res) => unwrapApiResponse(res))
    );
  }

  createRole(role: CreateRoleRequest): Observable<void> {
    return this.http.post<ApiResponse<unknown> | unknown>(this.apiUrl, role).pipe(
      map(() => undefined)
    );
  }

  deleteRole(roleName: string): Observable<void> {
    return this.http.delete<ApiResponse<unknown> | unknown>(`${this.apiUrl}/${roleName}`).pipe(
      map(() => undefined)
    );
  }

  assignRole(request: AssignRoleRequest): Observable<void> {
    return this.http.post<ApiResponse<unknown> | unknown>(`${this.apiUrl}/assign`, request).pipe(
      map(() => undefined)
    );
  }

  getUserRoles(email: string): Observable<string[]> {
    return this.http.get<ApiResponse<string[]> | string[]>(`${this.apiUrl}/user/${encodeURIComponent(email)}`).pipe(
      map((res) => unwrapApiResponse(res))
    );
  }
}
