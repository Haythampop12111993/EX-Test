import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, unwrapApiResponse } from '../models/common.model';
import { EntityId, Region, RegionCreateRequest, RegionUpdateRequest } from '../models/geo.model';

@Injectable({
    providedIn: 'root'
})
export class RegionsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/Regions`;

    getRegions(): Observable<Region[]> {
        return this.http.get<ApiResponse<Region[]> | Region[]>(this.apiUrl).pipe(map(unwrapApiResponse));
    }

    createRegion(payload: RegionCreateRequest): Observable<void> {
        return this.http.post<ApiResponse<unknown> | unknown>(this.apiUrl, payload).pipe(map(() => undefined));
    }

    updateRegion(id: EntityId, payload: RegionUpdateRequest): Observable<void> {
        return this.http.put<ApiResponse<unknown> | unknown>(`${this.apiUrl}/${id}`, payload).pipe(map(() => undefined));
    }

    deleteRegion(id: EntityId): Observable<void> {
        return this.http.delete<ApiResponse<unknown> | unknown>(`${this.apiUrl}/${id}`).pipe(map(() => undefined));
    }
}
