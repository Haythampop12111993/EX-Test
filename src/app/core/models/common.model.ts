export type EntityId = number;

export interface ApiResponse<T> {
    statusCode: number;
    succeeded: boolean;
    message: string;
    errors: string[];
    data: T;
}

export const isApiResponse = <T = unknown>(value: unknown): value is ApiResponse<T> => {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return 'succeeded' in v && 'data' in v;
};

export const unwrapApiResponse = <T>(value: ApiResponse<T> | T): T =>
    isApiResponse<T>(value) ? value.data : value;

export interface PagedResult<T> {
    data: T[];
    count: number;
    pageIndex: number;
    pageSize: number;
}
