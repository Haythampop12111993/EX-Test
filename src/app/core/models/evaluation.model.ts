import { EntityId } from './common.model';

export type EvaluationType = 1 | 2;

export interface EvaluationChecklistItemCreateDto {
    itemKey: string;
    isOk: boolean;
    note?: string;
}

export interface ScoutingEvaluationCreateDto {
    scoutingReportId: EntityId;
    isAccepted: boolean;
    canProceedToControl?: boolean;
    score: number;
    comments?: string;
    cancellationReasons?: string[];
    items: EvaluationChecklistItemCreateDto[];
}

export interface ControlEvaluationCreateDto {
    scoutingReportId: EntityId;
    isAccepted: boolean;
    score: number;
    comments?: string;
    rejectionReasons?: string[];
    items: EvaluationChecklistItemCreateDto[];
}

export interface EvaluationDto {
    id: EntityId;
    evaluationDate: string;
    score: number;
    comments?: string;
    type: EvaluationType;
    isAccepted: boolean;
    canProceedToControl?: boolean | null;
    scoutingReportId: EntityId;
    evaluatorUserId?: string;
    evaluatorUserName?: string;
    items?: EvaluationChecklistItemDto[];
}

export interface ChecklistTemplateDto {
    key?: string;
    label?: string;
    description?: string;
}

export interface EvaluationChecklistItemDto {
    id: EntityId;
    itemKey?: string;
    isOk: boolean;
    note?: string;
}

export interface EnumValueDto {
    id: EntityId;
    name?: string;
}
