import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResult, unwrapApiResponse } from '../models/common.model';
import {
    AssignPesticideRequest,
    EntityId,
    PestCreateRequest,
    PestDetails,
    PestListItem,
    PestLookupItem,
    PestTypeLookupItem,
    PestUpdateRequest,
    UpdateDilutionRateRequest
} from '../models/pest.model';

@Injectable({
    providedIn: 'root'
})
export class PestsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/Pests`;

    getPests(params?: {
        PageIndex?: number;
        Sort?: string;
        Search?: string;
        TypeId?: EntityId;
        PageSize?: number;
    }): Observable<PagedResult<PestListItem>> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.PageIndex != null) httpParams = httpParams.set('PageIndex', String(params.PageIndex));
            if (params.PageSize != null) httpParams = httpParams.set('PageSize', String(params.PageSize));
            if (params.Sort) httpParams = httpParams.set('Sort', params.Sort);
            if (params.Search) httpParams = httpParams.set('Search', params.Search);
            if (params.TypeId != null) httpParams = httpParams.set('TypeId', String(params.TypeId));
        }

        return this.http
            .get<ApiResponse<PagedResult<PestListItem>> | PagedResult<PestListItem>>(this.apiUrl, { params: httpParams })
            .pipe(
                map((res) => {
                    const value = unwrapApiResponse(res);
                    const anyValue = value as unknown as { pageSiza?: number };
                    return {
                        data: value?.data ?? [],
                        count: value?.count ?? 0,
                        pageIndex: value?.pageIndex ?? 1,
                        pageSize: value?.pageSize ?? anyValue?.pageSiza ?? (params?.PageSize ?? 10)
                    };
                })
            );
    }

    getPestById(id: EntityId): Observable<PestDetails> {
        return this.http.get<ApiResponse<PestDetails> | PestDetails>(`${this.apiUrl}/${id}`).pipe(map(unwrapApiResponse));
    }

    getPestChildren(parentId: EntityId): Observable<PestListItem[]> {
        return this.http
            .get<ApiResponse<PestListItem[]> | PestListItem[]>(`${this.apiUrl}/${parentId}/children`)
            .pipe(map(unwrapApiResponse));
    }

    getPestsLookup(): Observable<PestLookupItem[]> {
        return this.http.get<ApiResponse<PestLookupItem[]> | PestLookupItem[]>(`${this.apiUrl}/lookup`).pipe(map(unwrapApiResponse));
    }

    getPestTypes(): Observable<PestTypeLookupItem[]> {
        return this.http.get<ApiResponse<PestTypeLookupItem[]> | PestTypeLookupItem[]>(`${this.apiUrl}/types`).pipe(map(unwrapApiResponse));
    }

    createPest(payload: PestCreateRequest): Observable<void> {
        return this.http.post<ApiResponse<unknown> | unknown>(this.apiUrl, payload).pipe(map(() => undefined));
    }

    updatePest(id: EntityId, payload: PestUpdateRequest): Observable<void> {
        return this.http.put<ApiResponse<unknown> | unknown>(`${this.apiUrl}/${id}`, payload).pipe(map(() => undefined));
    }

    deletePest(id: EntityId): Observable<void> {
        return this.http.delete<ApiResponse<unknown> | unknown>(`${this.apiUrl}/${id}`).pipe(map(() => undefined));
    }

    assignPesticide(payload: AssignPesticideRequest): Observable<void> {
        return this.http.post<ApiResponse<unknown> | unknown>(`${this.apiUrl}/assign-pesticide`, payload).pipe(map(() => undefined));
    }

    updateDilutionRate(payload: UpdateDilutionRateRequest): Observable<void> {
        return this.http.put<ApiResponse<unknown> | unknown>(`${this.apiUrl}/update-dilution-rate`, payload).pipe(map(() => undefined));
    }

    removePesticide(params: { pestId: EntityId; pesticideId: EntityId }): Observable<void> {
        const httpParams = new HttpParams()
            .set('pestId', String(params.pestId))
            .set('pesticideId', String(params.pesticideId));

        return this.http
            .delete<ApiResponse<unknown> | unknown>(`${this.apiUrl}/remove-pesticide`, { params: httpParams })
            .pipe(map(() => undefined));
    }
}
