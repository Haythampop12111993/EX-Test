export interface EngineerPerformanceDto {
    engineerName?: string;
    totalOperations: number;
    totalQuantityUsed: number;
    followUpRequiredCount: number;
    successRate: number;
    errorRate: number;
}

export interface ScoutPerformanceDto {
    scoutName?: string;
    totalReports: number;
    approvedReports: number;
    rejectedReports: number;
    accuracyRate: number;
    errorRate: number;
}

export interface PesticideConsumptionReportDto {
    pesticideName?: string;
    areaName?: string;
    totalQuantityUsed: number;
    unit?: string;
}

export interface InfestationReportDto {
    pestName?: string;
    areaName?: string;
    incidenceCount: number;
    averageSeverity: number;
}

export interface StockAlertDto {
    pesticideName?: string;
    currentStock: number;
    form?: string;
    alertLevel?: string;
}

export interface ResponseTimeReportDto {
    areaName?: string;
    averageResponseTimeHours: number;
    totalOperations: number;
}

export interface EvaluatorPerformanceDto {
    evaluatorName?: string;
    totalEvaluations: number;
    approvedCount: number;
    rejectedCount: number;
}

export interface UserSummaryDto {
    id?: string;
    fullName?: string;
    email?: string;
    role?: string;
    phoneNumber?: string;
    isActive: boolean;
}
