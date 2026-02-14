import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, unwrapApiResponse } from '../models/common.model';
import { ConsumeRequest, EntityId, MixRequest, QuantityCheckResult, RawStockQuantityResult, ReadyStockItem } from '../models/inventory.model';

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/Inventory`;

    mix(payload: MixRequest): Observable<boolean> {
        return this.http.post<ApiResponse<boolean> | boolean>(`${this.apiUrl}/mix`, payload).pipe(map(unwrapApiResponse));
    }

    consume(payload: ConsumeRequest): Observable<boolean> {
        return this.http.post<ApiResponse<boolean> | boolean>(`${this.apiUrl}/consume`, payload).pipe(map(unwrapApiResponse));
    }

    getMyReadyStocks(): Observable<ReadyStockItem[]> {
        return this.http.get<ApiResponse<ReadyStockItem[]> | ReadyStockItem[]>(`${this.apiUrl}/my-ready-stocks`).pipe(map(unwrapApiResponse));
    }

    quantityCheck(params: { pesticideId: EntityId; pestId: EntityId }): Observable<QuantityCheckResult> {
        const httpParams = new HttpParams()
            .set('pesticideId', String(params.pesticideId))
            .set('pestId', String(params.pestId));

        return this.http
            .get<ApiResponse<number> | number>(`${this.apiUrl}/quantity-check`, { params: httpParams })
            .pipe(map(unwrapApiResponse));
    }

    getRawStockQuantity(pesticideId: EntityId): Observable<RawStockQuantityResult> {
        return this.http
            .get<ApiResponse<number> | number>(`${this.apiUrl}/raw-stock-quantity/${pesticideId}`)
            .pipe(map(unwrapApiResponse));
    }
}
