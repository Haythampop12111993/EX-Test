export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    errors?: string[];
}

export interface Pagination<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}
