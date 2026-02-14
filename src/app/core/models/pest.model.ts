export type EntityId = string | number;

export interface PestLookupItem {
    id: EntityId;
    name: string;
}

export interface PestTypeLookupItem {
    id: EntityId;
    name: string;
}

export interface PestListItem {
    id: EntityId;
    name: string;
    typeId?: EntityId;
    typeName?: string;
    parentId?: EntityId | null;
    parentPestId?: EntityId | null;
    scientificName?: string;
    description?: string;
    type?: string;
}

export interface PestDetails extends PestListItem {
    children?: PestListItem[];
    pesticides?: PestPesticideLink[];
}

export interface PestPesticideLink {
    pesticideId: EntityId;
    dilutionRate: number;
    pesticideName?: string;
}

export interface PestUpsertRequest {
    name: string;
    scientificName?: string;
    description?: string;
    type?: string;
    parentPestId?: EntityId | null;
}

export type PestCreateRequest = PestUpsertRequest;
export type PestUpdateRequest = PestUpsertRequest;

export interface AssignPesticideRequest {
    pestId: EntityId;
    pesticideId: EntityId;
    dilutionRate: number;
}

export type UpdateDilutionRateRequest = AssignPesticideRequest;
