import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, CreateUserRequest, UpdateUserRequest, UserListResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Users`;

  getAllUsers(params?: { 
    PageIndex?: number; 
    PageSize?: number; 
    Search?: string; 
    RegionId?: number; 
    AreaId?: number; 
    Sort?: string; 
  }): Observable<UserListResponse> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.PageIndex) httpParams = httpParams.set('PageIndex', params.PageIndex);
      if (params.PageSize) httpParams = httpParams.set('PageSize', params.PageSize);
      if (params.Search) httpParams = httpParams.set('Search', params.Search);
      if (params.RegionId) httpParams = httpParams.set('RegionId', params.RegionId);
      if (params.AreaId) httpParams = httpParams.set('AreaId', params.AreaId);
      if (params.Sort) httpParams = httpParams.set('Sort', params.Sort);
    }
    return this.http.get<any>(`${this.apiUrl}/all-users`, { params: httpParams }).pipe(
      map(response => {
        if (!response) {
            return { data: [], count: 0, pageIndex: 1, pageSize: 10 };
        }
        return {
            ...response,
            pageSize: response.pageSiza || response.pageSize || 10, // Handle typo and default
            data: response.data || []
        };
      })
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: CreateUserRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, user);
  }

  updateUser(user: UpdateUserRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}
