import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';
import { RolePermissionsDto, UpdatePermissionsRequest } from '../models/permissions.model';
import { ApiResponse, unwrapApiResponse } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/roles`;

  getRolePermissions(roleId: string): Observable<RolePermissionsDto> {
    return this.http.get<ApiResponse<RolePermissionsDto> | RolePermissionsDto>(`${this.apiUrl}/${roleId}/permissions`).pipe(
      map((res) => unwrapApiResponse(res))
    );
  }

  updatePermissions(request: UpdatePermissionsRequest): Observable<void> {
    return this.http.put<ApiResponse<unknown> | unknown>(`${this.apiUrl}/permissions`, request).pipe(
      map(() => undefined)
    );
  }

  getAllPermissions(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]> | string[]>(`${this.apiUrl}/all-permissions`).pipe(
      map((res) => unwrapApiResponse(res))
    );
  }
}
