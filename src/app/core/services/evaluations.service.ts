import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, unwrapApiResponse } from '../models/common.model';
import { EntityId } from '../models/common.model';
import {
    ChecklistTemplateDto,
    ControlEvaluationCreateDto,
    EnumValueDto,
    EvaluationDto,
    ScoutingEvaluationCreateDto
} from '../models/evaluation.model';

@Injectable({
    providedIn: 'root'
})
export class EvaluationsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/Evaluations`;

    createScoutingEvaluation(payload: ScoutingEvaluationCreateDto): Observable<EvaluationDto> {
        return this.http.post<ApiResponse<EvaluationDto>>(`${this.apiUrl}/scouting-check`, payload).pipe(map(unwrapApiResponse));
    }

    createControlEvaluation(payload: ControlEvaluationCreateDto): Observable<EvaluationDto> {
        return this.http.post<ApiResponse<EvaluationDto>>(`${this.apiUrl}/control-check`, payload).pipe(map(unwrapApiResponse));
    }

    getEvaluationReport(reportId: EntityId): Observable<EvaluationDto[]> {
        return this.http.get<ApiResponse<EvaluationDto[]>>(`${this.apiUrl}/report/${reportId}`).pipe(map(unwrapApiResponse));
    }

    getChecklistTemplates(type: string): Observable<ChecklistTemplateDto[]> {
        return this.http.get<ApiResponse<ChecklistTemplateDto[]>>(`${this.apiUrl}/templates/${encodeURIComponent(type)}`).pipe(map(unwrapApiResponse));
    }

    getControlRejectionReasons(): Observable<EnumValueDto[]> {
        return this.http.get<ApiResponse<EnumValueDto[]>>(`${this.apiUrl}/rejection-reasons/control`).pipe(map(unwrapApiResponse));
    }

    getScoutingRejectionReasons(): Observable<EnumValueDto[]> {
        return this.http.get<ApiResponse<EnumValueDto[]>>(`${this.apiUrl}/rejection-reasons/scouting`).pipe(map(unwrapApiResponse));
    }
}
