import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, CreateUserRequest, UpdateUserRequest, UserListResponse } from '../models/user.model';
import { ApiResponse, unwrapApiResponse } from '../models/common.model';

type UsersListApiResponse = Partial<UserListResponse> & {
  pageSiza?: number;
};

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
      if (params.PageIndex) httpParams = httpParams.set('PageIndex', String(params.PageIndex));
      if (params.PageSize) httpParams = httpParams.set('PageSize', String(params.PageSize));
      if (params.Search) httpParams = httpParams.set('Search', params.Search);
      if (params.RegionId) httpParams = httpParams.set('RegionId', String(params.RegionId));
      if (params.AreaId) httpParams = httpParams.set('AreaId', String(params.AreaId));
      if (params.Sort) httpParams = httpParams.set('Sort', params.Sort);
    }
    return this.http.get<ApiResponse<UsersListApiResponse> | UsersListApiResponse>(this.apiUrl, { params: httpParams }).pipe(
      map((res) => {
        const response = unwrapApiResponse(res);

        if (!response) {
            return { data: [], count: 0, pageIndex: 1, pageSize: 10 };
        }

        const pageSize = response.pageSiza ?? response.pageSize ?? 10;
        const pageIndex = response.pageIndex ?? 1;
        const count = response.count ?? 0;
        const data = response.data ?? [];

        return {
            ...response,
            pageIndex,
            count,
            pageSize,
            data
        };
      })
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<ApiResponse<User> | User>(`${this.apiUrl}/${id}`).pipe(
      map((res) => unwrapApiResponse(res))
    );
  }

  createUser(user: CreateUserRequest): Observable<void> {
    return this.http.post<ApiResponse<unknown> | unknown>(this.apiUrl, user).pipe(
      map(() => undefined)
    );
  }

  updateUser(user: UpdateUserRequest): Observable<void> {
    return this.http.put<ApiResponse<unknown> | unknown>(this.apiUrl, user).pipe(
      map(() => undefined)
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<ApiResponse<unknown> | unknown>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined)
    );
  }
}
