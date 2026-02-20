import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, unwrapApiResponse } from '../models/common.model';
import {
    EvaluatorPerformanceDto,
    EngineerPerformanceDto,
    InfestationReportDto,
    PesticideConsumptionReportDto,
    ResponseTimeReportDto,
    ScoutPerformanceDto,
    StockAlertDto,
    UserSummaryDto
} from '../models/reports.model';

@Injectable({
    providedIn: 'root'
})
export class ReportsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/Reports`;

    getScoutPerformance(params?: { from?: string; to?: string; areaId?: number }): Observable<ScoutPerformanceDto[]> {
        let httpParams = new HttpParams();
        if (params?.from) httpParams = httpParams.set('from', params.from);
        if (params?.to) httpParams = httpParams.set('to', params.to);
        if (params?.areaId != null) httpParams = httpParams.set('areaId', String(params.areaId));

        return this.http
            .get<ApiResponse<ScoutPerformanceDto[]>>(`${this.apiUrl}/scout-performance`, { params: httpParams })
            .pipe(map(unwrapApiResponse));
    }

    getPesticideConsumption(params?: { from?: string; to?: string; areaId?: number }): Observable<PesticideConsumptionReportDto[]> {
        let httpParams = new HttpParams();
        if (params?.from) httpParams = httpParams.set('from', params.from);
        if (params?.to) httpParams = httpParams.set('to', params.to);
        if (params?.areaId != null) httpParams = httpParams.set('areaId', String(params.areaId));

        return this.http
            .get<ApiResponse<PesticideConsumptionReportDto[]>>(`${this.apiUrl}/pesticide-consumption`, { params: httpParams })
            .pipe(map(unwrapApiResponse));
    }

    getInfestation(params?: { from?: string; to?: string; areaId?: number }): Observable<InfestationReportDto[]> {
        let httpParams = new HttpParams();
        if (params?.from) httpParams = httpParams.set('from', params.from);
        if (params?.to) httpParams = httpParams.set('to', params.to);
        if (params?.areaId != null) httpParams = httpParams.set('areaId', String(params.areaId));

        return this.http
            .get<ApiResponse<InfestationReportDto[]>>(`${this.apiUrl}/infestation`, { params: httpParams })
            .pipe(map(unwrapApiResponse));
    }

    getEngineerPerformance(params?: { from?: string; to?: string }): Observable<EngineerPerformanceDto[]> {
        let httpParams = new HttpParams();
        if (params?.from) httpParams = httpParams.set('from', params.from);
        if (params?.to) httpParams = httpParams.set('to', params.to);

        return this.http
            .get<ApiResponse<EngineerPerformanceDto[]>>(`${this.apiUrl}/engineer-performance`, { params: httpParams })
            .pipe(map(unwrapApiResponse));
    }

    getResponseTime(params?: { from?: string; to?: string }): Observable<ResponseTimeReportDto[]> {
        let httpParams = new HttpParams();
        if (params?.from) httpParams = httpParams.set('from', params.from);
        if (params?.to) httpParams = httpParams.set('to', params.to);

        return this.http
            .get<ApiResponse<ResponseTimeReportDto[]>>(`${this.apiUrl}/response-time`, { params: httpParams })
            .pipe(map(unwrapApiResponse));
    }

    getStockAlerts(): Observable<StockAlertDto[]> {
        return this.http.get<ApiResponse<StockAlertDto[]>>(`${this.apiUrl}/stock-alerts`).pipe(map(unwrapApiResponse));
    }

    getEvaluatorPerformance(params?: { from?: string; to?: string }): Observable<EvaluatorPerformanceDto[]> {
        let httpParams = new HttpParams();
        if (params?.from) httpParams = httpParams.set('from', params.from);
        if (params?.to) httpParams = httpParams.set('to', params.to);

        return this.http
            .get<ApiResponse<EvaluatorPerformanceDto[]>>(`${this.apiUrl}/evaluator-performance`, { params: httpParams })
            .pipe(map(unwrapApiResponse));
    }

    getUserSummary(params?: { search?: string }): Observable<UserSummaryDto[]> {
        let httpParams = new HttpParams();
        if (params?.search) httpParams = httpParams.set('search', params.search);

        return this.http
            .get<ApiResponse<UserSummaryDto[]>>(`${this.apiUrl}/user-summary`, { params: httpParams })
            .pipe(map(unwrapApiResponse));
    }
}
