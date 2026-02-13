export type EntityId = string | number;

export interface MixRequest {
    pesticideId: EntityId;
    rawQuantity: number;
    pestId: EntityId;
}

export interface ConsumeRequest {
    readyStockId: EntityId;
    litersUsed: number;
}

export interface ReadyStockItem {
    id: EntityId;
    pesticideId?: EntityId;
    pesticideName?: string;
    pestId?: EntityId;
    pestName?: string;
    availableLiters?: number;
}

export interface QuantityCheckResult {
    pesticideId: EntityId;
    pestId: EntityId;
    isEnough?: boolean;
    availableQuantity?: number;
}

export interface RawStockQuantityResult {
    pesticideId: EntityId;
    availableQuantity?: number;
}
