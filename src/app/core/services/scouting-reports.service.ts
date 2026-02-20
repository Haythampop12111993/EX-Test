import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResult, unwrapApiResponse } from '../models/common.model';
import { EntityId } from '../models/common.model';
import { ControlOperationCreateDto, ScoutingDetailsDto, ScoutingReportCreateDto, ScoutingReportCreatedDto, ScoutingSummaryDto } from '../models/scouting.model';
import { ReadyStockItem } from '../models/inventory.model';

@Injectable({
    providedIn: 'root'
})
export class ScoutingReportsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/ScoutingReports`;

    // POST /api/ScoutingReports
    createScoutingReport(payload: ScoutingReportCreateDto): Observable<ScoutingReportCreatedDto> {
        const formData = new FormData();
        if (payload.Latitude) formData.append('Latitude', payload.Latitude.toString());
        if (payload.Longitude) formData.append('Longitude', payload.Longitude.toString());
        formData.append('AddressDetails', payload.AddressDetails);
        formData.append('Notes', payload.Notes);
        formData.append('Source', payload.Source);
        formData.append('Priority', payload.Priority);
        formData.append('PriorityReason', payload.PriorityReason);
        formData.append('InfestationLevel', payload.InfestationLevel);

        payload.Pests.forEach((pest, index) => {
            formData.append(`Pests[${index}].pestId`, pest.pestId.toString());
            formData.append(`Pests[${index}].severity`, pest.severity);
            formData.append(`Pests[${index}].affectedAreaPercentage`, pest.affectedAreaPercentage.toString());
            if (pest.localNotes) formData.append(`Pests[${index}].localNotes`, pest.localNotes);
        });

        if (payload.Images) {
            payload.Images.forEach(image => {
                formData.append('Images', image);
            });
        }

        return this.http.post<ApiResponse<ScoutingReportCreatedDto> | ScoutingReportCreatedDto>(this.apiUrl, formData).pipe(map(unwrapApiResponse));
    }

    // GET /api/ScoutingReports
    getScoutingReports(params?: {
        PageSize?: number;
        PageIndex?: number;
        Search?: string;
        SortBy?: string;
        SortDirection?: string;
        StartDate?: string;
        EndDate?: string;
        RegionId?: EntityId;
        Status?: string;
    }): Observable<PagedResult<ScoutingSummaryDto>> {
        let httpParams = new HttpParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value != null) httpParams = httpParams.set(key, String(value));
            });
        }

        return this.http
            .get<ApiResponse<PagedResult<ScoutingSummaryDto>>>(this.apiUrl, { params: httpParams })
            .pipe(
                map((res) => {
                    const value = unwrapApiResponse(res);
                    return {
                        data: value?.data ?? [],
                        count: value?.count ?? 0,
                        pageIndex: value?.pageIndex ?? 1,
                        pageSize: value?.pageSize ?? (params?.PageSize ?? 10)
                    };
                })
            );
    }

    // GET /api/ScoutingReports/{id}
    getScoutingReportById(id: EntityId): Observable<ScoutingDetailsDto> {
        return this.http
            .get<ApiResponse<ScoutingDetailsDto>>(`${this.apiUrl}/${id}`)
            .pipe(map(unwrapApiResponse));
    }

    // PUT /api/ScoutingReports/{id}/status
    updateScoutingReportStatus(id: EntityId, status: string): Observable<void> {
        return this.http
            .put<ApiResponse<unknown>>(`${this.apiUrl}/${id}/status`, JSON.stringify(status), {
                headers: { 'Content-Type': 'application/json' }
            })
            .pipe(map(() => undefined));
    }

    // PUT /api/ScoutingReports/{id}/assign
    assignScout(id: EntityId, scoutId: EntityId): Observable<void> {
        return this.http
            .put<ApiResponse<unknown>>(`${this.apiUrl}/${id}/assign`, null, {
                params: { scoutId: String(scoutId) }
            })
            .pipe(map(() => undefined));
    }

    // GET /api/ScoutingReports/{id}/ready-stocks
    getReadyStocks(id: EntityId): Observable<ReadyStockItem[]> {
        return this.http
            .get<ApiResponse<ReadyStockItem[]>>(`${this.apiUrl}/${id}/ready-stocks`)
            .pipe(map(unwrapApiResponse));
    }

    // POST /api/ScoutingReports/{id}/control-operations
    createControlOperation(id: EntityId, payload: ControlOperationCreateDto): Observable<void> {
        return this.http
            .post<ApiResponse<unknown>>(`${this.apiUrl}/${id}/control-operations`, payload)
            .pipe(map(() => undefined));
    }
}
