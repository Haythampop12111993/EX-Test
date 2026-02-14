import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResult, unwrapApiResponse } from '../models/common.model';
import {
    EntityId,
    PesticideFormLookupItem,
    PesticideListItem,
    PesticideLookupItem,
    PesticideUpsertFormValue,
    ToxicityLevelLookupItem
} from '../models/pesticide.model';

@Injectable({
    providedIn: 'root'
})
export class PesticidesService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/Pesticides`;

    getPesticides(params?: { PageSize?: number; PageIndex?: number; Search?: string; TypeId?: EntityId }): Observable<PagedResult<PesticideListItem>> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.PageIndex != null) httpParams = httpParams.set('PageIndex', String(params.PageIndex));
            if (params.PageSize != null) httpParams = httpParams.set('PageSize', String(params.PageSize));
            if (params.Search) httpParams = httpParams.set('Search', params.Search);
            if (params.TypeId != null) httpParams = httpParams.set('TypeId', String(params.TypeId));
        }

        return this.http
            .get<ApiResponse<PagedResult<PesticideListItem>> | PagedResult<PesticideListItem>>(this.apiUrl, { params: httpParams })
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

    getPesticideById(id: EntityId): Observable<PesticideListItem> {
        return this.http.get<ApiResponse<PesticideListItem> | PesticideListItem>(`${this.apiUrl}/${id}`).pipe(map(unwrapApiResponse));
    }

    createPesticide(payload: FormData | PesticideUpsertFormValue): Observable<void> {
        const body = payload instanceof FormData ? payload : this.toFormData(payload);
        return this.http.post<ApiResponse<unknown> | unknown>(this.apiUrl, body).pipe(map(() => undefined));
    }

    updatePesticide(id: EntityId, payload: FormData | PesticideUpsertFormValue): Observable<void> {
        const body = payload instanceof FormData ? payload : this.toFormData(payload);
        return this.http.put<ApiResponse<unknown> | unknown>(`${this.apiUrl}/${id}`, body).pipe(map(() => undefined));
    }

    deletePesticide(id: EntityId): Observable<void> {
        return this.http.delete<ApiResponse<unknown> | unknown>(`${this.apiUrl}/${id}`).pipe(map(() => undefined));
    }

    getForms(): Observable<PesticideFormLookupItem[]> {
        return this.http.get<ApiResponse<PesticideFormLookupItem[]> | PesticideFormLookupItem[]>(`${this.apiUrl}/forms`).pipe(map(unwrapApiResponse));
    }

    getToxicityLevels(): Observable<ToxicityLevelLookupItem[]> {
        return this.http
            .get<ApiResponse<ToxicityLevelLookupItem[]> | ToxicityLevelLookupItem[]>(`${this.apiUrl}/toxicity-levels`)
            .pipe(map(unwrapApiResponse));
    }

    getPesticidesByPestLookup(pestId: EntityId): Observable<PesticideLookupItem[]> {
        const params = new HttpParams().set('pestId', String(pestId));
        return this.http
            .get<ApiResponse<PesticideLookupItem[]> | PesticideLookupItem[]>(`${this.apiUrl}/get-pesticides-by-id-pest-lookup`, { params })
            .pipe(map(unwrapApiResponse));
    }

    private toFormData(value: PesticideUpsertFormValue): FormData {
        const formData = new FormData();

        const appendValue = (key: string, v: unknown) => {
            if (v === undefined || v === null) return;
            if (Array.isArray(v)) {
                v.forEach((item, idx) => {
                    if (item && typeof item === 'object' && !(item instanceof Blob)) {
                        Object.entries(item).forEach(([innerKey, innerValue]) => {
                            appendValue(`${key}[${idx}].${innerKey}`, innerValue);
                        });
                        return;
                    }
                    appendValue(`${key}[${idx}]`, item);
                });
                return;
            }

            if (typeof v === 'string') formData.append(key, v);
            else if (typeof v === 'number') formData.append(key, String(v));
            else if (typeof v === 'boolean') formData.append(key, v ? 'true' : 'false');
            else if (v instanceof Blob) formData.append(key, v);
            else formData.append(key, String(v));
        };

        Object.entries(value).forEach(([key, v]) => appendValue(key, v));

        return formData;
    }
}
