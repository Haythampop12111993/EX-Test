import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, CreateRoleRequest, AssignRoleRequest } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Role`;

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  createRole(role: CreateRoleRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/createRole`, role);
  }

  deleteRole(roleName: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteRole/${roleName}`);
  }

  assignRole(request: AssignRoleRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign`, request);
  }

  getUserRoles(email: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/user-roles/${email}`);
  }
}
