export type EntityId = string | number;

export interface PesticideListItem {
    id: EntityId;
    name: string;
    activeIngredient?: string;
    toxicity?: string;
    form?: string;
    requiresSensitivityTest?: boolean;
    allergyWarning?: string;
    sensitivityTestFileUrl?: string;
    concentration?: number;
    safetyInstructions?: string;
    stockQuantity?: number;
    targetedPestsDto?: TargetedPestDto[];
}

export interface TargetedPestDto {
    pestId: EntityId;
    pestName?: string;
    dilutionRate: number;
}

export interface TargetPestUpsert {
    PestId: EntityId;
    DilutionRate: number;
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

export interface PesticideUpsertFormValue {
    Name: string;
    ActiveIngredient: string;
    Toxicity?: string;
    Form: string;
    RequiresSensitivityTest?: boolean;
    AllergyWarning?: string;
    SensitivityTestFile?: File | Blob;
    Concentration?: number;
    StockQuantity?: number;
    SafetyInstructions?: string;
    TargetPests?: TargetPestUpsert[];
}
