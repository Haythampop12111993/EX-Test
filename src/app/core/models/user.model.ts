export interface User {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    nationalId?: string;
    roles: string[];
    regionName?: string;
    assignedAreaId?: number;
    areaName?: string;
}

export interface CreateUserRequest {
    fullName: string;
    email: string;
    phoneNumber: string;
    nationalId: string;
    password: string;
    assignedAreaId: number;
    roles: string[];
}

export interface UpdateUserRequest {
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    assignedAreaId: number;
    roles: string[];
}

export interface UserListResponse {
    pageIndex: number;
    pageSize: number; // Assuming standard naming despite typo in spec, will check mapping if needed
    count: number;
    data: User[];
}
