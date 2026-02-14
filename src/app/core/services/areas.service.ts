import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, unwrapApiResponse } from '../models/common.model';
import { Area, AreaCreateRequest, AreaUpdateRequest, EntityId } from '../models/geo.model';

@Injectable({
    providedIn: 'root'
})
export class AreasService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/Areas`;

    getAreas(regionId?: EntityId): Observable<Area[]> {
        let params = new HttpParams();
        if (regionId != null) params = params.set('regionId', String(regionId));

        return this.http.get<ApiResponse<Area[]> | Area[]>(this.apiUrl, { params }).pipe(map(unwrapApiResponse));
    }

    getAreaById(id: EntityId): Observable<Area> {
        return this.http.get<ApiResponse<Area> | Area>(`${this.apiUrl}/${id}`).pipe(map(unwrapApiResponse));
    }

    createArea(payload: AreaCreateRequest): Observable<void> {
        return this.http.post<ApiResponse<unknown> | unknown>(this.apiUrl, payload).pipe(map(() => undefined));
    }

    updateArea(id: EntityId, payload: AreaUpdateRequest): Observable<void> {
        return this.http.put<ApiResponse<unknown> | unknown>(`${this.apiUrl}/${id}`, payload).pipe(map(() => undefined));
    }

    deleteArea(id: EntityId): Observable<void> {
        return this.http.delete<ApiResponse<unknown> | unknown>(`${this.apiUrl}/${id}`).pipe(map(() => undefined));
    }
}
