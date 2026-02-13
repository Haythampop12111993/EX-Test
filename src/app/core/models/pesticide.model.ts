export type EntityId = string | number;

export interface PesticideListItem {
    id: EntityId;
    name: string;
    typeId?: EntityId;
    typeName?: string;
    formId?: EntityId;
    formName?: string;
    toxicityLevelId?: EntityId;
    toxicityLevelName?: string;
}

export interface PesticideDetails extends PesticideListItem {
    description?: string;
    sensitivityTestFileUrl?: string;
}

export interface PesticideLookupItem {
    id: EntityId;
    name: string;
}

export interface PesticideFormLookupItem {
    id: EntityId;
    name: string;
}

export interface ToxicityLevelLookupItem {
    id: EntityId;
    name: string;
}

export type PesticideUpsertFormValue = Record<
    string,
    string | number | boolean | File | Blob | null | undefined
>;
