import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { RolePermissionsDto, UpdatePermissionsRequest } from '../models/permissions.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/RolesAndPermissions`;

  getRolePermissions(roleId: string): Observable<RolePermissionsDto> {
    return this.http.get<RolePermissionsDto>(`${this.apiUrl}/manage-permissions/${roleId}`);
  }

  updatePermissions(request: UpdatePermissionsRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-permissions`, request);
  }

  getAllRolesPermissions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all-roles-permissions`);
  }
}
