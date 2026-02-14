export type EntityId = string | number;

export interface Region {
    id: EntityId;
    name: string;
}

export interface RegionCreateRequest {
    name: string;
}

export type RegionUpdateRequest = RegionCreateRequest;

export interface Area {
    id: EntityId;
    name: string;
    regionId?: EntityId;
    regionName?: string;
}

export interface AreaCreateRequest {
    name: string;
    regionId: EntityId;
    regionName?: string;
}

export type AreaUpdateRequest = AreaCreateRequest;
