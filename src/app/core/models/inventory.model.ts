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
    pesticideName: string;
    pestName: string;
    totalLitersAvailable: number;
    areaName: string;
}

export type QuantityCheckResult = number;

export type RawStockQuantityResult = number;
