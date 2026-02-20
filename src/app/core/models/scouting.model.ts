import { EntityId } from './common.model';

// Enums
export type InfestationSeverity = 'Low' | 'Medium' | 'High' | 'Severe';
export type ScoutingPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ReportStatus = 'Pending' | 'In_Progress' | 'Completed' | 'Cancelled';
export type ScoutingSource = 'Manual' | 'System' | 'Imported';

// DTOs
export interface ScoutingPestCreateDto {
    pestId: EntityId;
    severity: string;
    affectedAreaPercentage: number;
    localNotes?: string;
}

export interface ScoutingReportCreateDto {
    Latitude?: number;
    Longitude?: number;
    AddressDetails: string;
    Notes: string;
    Source: ScoutingSource;
    Priority: ScoutingPriority;
    PriorityReason: string;
    InfestationLevel: InfestationSeverity;
    Pests: ScoutingPestCreateDto[];
    Images?: File[];
}

export interface ScoutingReportCreatedDto {
    id: EntityId;
    code: string;
}

export interface ScoutingPestSummaryDto {
    pestId: EntityId;
    pestName?: string;
    severity: InfestationSeverity;
    affectedAreaPercentage: number;
}

export interface ScoutingSummaryDto {
    id: EntityId;
    code: string;
    reportDate: string;
    areaName?: string;
    regionName?: string;
    scoutUserName?: string;
    isInfested: boolean;
    priority: ScoutingPriority;
    status: ReportStatus;
    pests?: ScoutingPestSummaryDto[];
}

export interface ScoutingDetailsDto {
    id: EntityId;
    code: string;
    reportDate: string;
    areaName?: string;
    regionName?: string;
    scoutUserName?: string;
    isInfested: boolean;
    infestationLevel: InfestationSeverity;
    infestedAreaPercentage: number;
    priority: ScoutingPriority;
    priorityReason?: string;
    status: ReportStatus;
    source: ScoutingSource;
    nextInspectionDate?: string;
    isNearSensitiveSite: boolean;
    pests?: ScoutingPestSummaryDto[];
    latitude: number;
    longitude: number;
    addressDetails?: string;
    notes?: string;
    imageUrls?: string[];
}

export interface ControlOperationCreateDto {
    readyStockId: EntityId;
    litersUsed: number;
    notes?: string;
    needsAnotherControl?: boolean;
    applicationMethod?: string;
    nextFollowUpDate?: string;
    evaluationDate?: string;
}
