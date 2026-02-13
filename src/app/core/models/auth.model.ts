export interface User {
    id: string;
    fullName: string;
    email: string;
    roles?: string[];
    permissions?: string[];
    regionName?: string;
    assignedAreaId?: number;
    areaName?: string;
    token: string;
}

export interface LoginResponseData {
    id: string;
    fullName: string;
    email: string;
    token: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}
