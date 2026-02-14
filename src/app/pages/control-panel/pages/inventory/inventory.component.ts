import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { forkJoin, finalize } from 'rxjs';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';
import { AppPermissions } from '../../../../core/constants/permissions';
import { InventoryService } from '../../../../core/services/inventory.service';
import { PesticidesService } from '../../../../core/services/pesticides.service';
import { PestsService } from '../../../../core/services/pests.service';
import { MixRequest, ConsumeRequest, EntityId, ReadyStockItem } from '../../../../core/models/inventory.model';
import { PesticideListItem } from '../../../../core/models/pesticide.model';
import { PestListItem } from '../../../../core/models/pest.model';
import { DynamicFormComponent } from '../../../../shared/components/dynamic-form/dynamic-form.component';
import { FieldConfig } from '../../../../shared/models/field-config.interface';

interface MixFormValue {
    pesticideId: EntityId;
    pestId: EntityId;
    rawQuantity: number;
}

interface ConsumeFormValue {
    litersUsed: number;
}

interface QuantityCheckFormValue {
    pesticideId: EntityId;
    pestId: EntityId;
}

interface RawStockFormValue {
    pesticideId: EntityId;
}

@Component({
    selector: 'app-inventory',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        ConfirmDialogModule,
        ToastModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        TableModule,
        TabsModule,
        DynamicFormComponent,
        HasPermissionDirective
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './inventory.component.html',
    styleUrl: './inventory.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryComponent implements OnInit {
    private inventoryService = inject(InventoryService);
    private pesticidesService = inject(PesticidesService);
    private pestsService = inject(PestsService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private translate = inject(TranslateService);

    protected readonly AppPermissions = AppPermissions;

    lookupsLoading = signal(false);
    readyStocksLoading = signal(false);
    mixSaving = signal(false);
    consumeSaving = signal(false);
    quantityCheckLoading = signal(false);
    rawStockLoading = signal(false);

    pesticides = signal<PesticideListItem[]>([]);
    pests = signal<PestListItem[]>([]);
    readyStocks = signal<ReadyStockItem[]>([]);

    quantityCheckResult = signal<number | null>(null);
    rawStockResult = signal<number | null>(null);

    displayConsumeDialog = false;
    selectedReadyStock = signal<ReadyStockItem | null>(null);

    pesticideOptions = computed(() => this.pesticides().map((p) => ({ label: p.name, value: p.id })));
    pestOptions = computed(() => this.pests().map((p) => ({ label: p.name, value: p.id })));

    mixFormConfig = computed<FieldConfig[]>(() => [
        {
            type: 'select',
            name: 'pesticideId',
            label: 'dashboard.controlPanel.inventory.pesticide',
            required: true,
            validations: [{ name: 'required', validator: Validators.required, message: 'common.required' }],
            options: this.pesticideOptions(),
            gridClass: 'col-span-12 md:col-span-4'
        },
        {
            type: 'select',
            name: 'pestId',
            label: 'dashboard.controlPanel.inventory.pest',
            required: true,
            validations: [{ name: 'required', validator: Validators.required, message: 'common.required' }],
            options: this.pestOptions(),
            gridClass: 'col-span-12 md:col-span-4'
        },
        {
            type: 'number',
            name: 'rawQuantity',
            label: 'dashboard.controlPanel.inventory.rawQuantity',
            required: true,
            validations: [
                { name: 'required', validator: Validators.required, message: 'common.required' },
                { name: 'min', validator: Validators.min(0.01), message: 'dashboard.controlPanel.inventory.validation.minQuantity' }
            ],
            gridClass: 'col-span-12 md:col-span-4'
        }
    ]);

    consumeFormConfig = computed<FieldConfig[]>(() => {
        const selected = this.selectedReadyStock();
        const maxAllowed = selected?.totalLitersAvailable ?? Number.MAX_SAFE_INTEGER;
        return [
            {
                type: 'number',
                name: 'litersUsed',
                label: 'dashboard.controlPanel.inventory.litersUsed',
                required: true,
                validations: [
                    { name: 'required', validator: Validators.required, message: 'common.required' },
                    { name: 'min', validator: Validators.min(0.01), message: 'dashboard.controlPanel.inventory.validation.minQuantity' },
                    { name: 'max', validator: Validators.max(maxAllowed), message: 'dashboard.controlPanel.inventory.validation.maxLiters' }
                ],
                gridClass: 'col-span-12'
            }
        ];
    });

    quantityCheckFormConfig = computed<FieldConfig[]>(() => [
        {
            type: 'select',
            name: 'pesticideId',
            label: 'dashboard.controlPanel.inventory.pesticide',
            required: true,
            validations: [{ name: 'required', validator: Validators.required, message: 'common.required' }],
            options: this.pesticideOptions(),
            gridClass: 'col-span-12 md:col-span-6'
        },
        {
            type: 'select',
            name: 'pestId',
            label: 'dashboard.controlPanel.inventory.pest',
            required: true,
            validations: [{ name: 'required', validator: Validators.required, message: 'common.required' }],
            options: this.pestOptions(),
            gridClass: 'col-span-12 md:col-span-6'
        }
    ]);

    rawStockFormConfig = computed<FieldConfig[]>(() => [
        {
            type: 'select',
            name: 'pesticideId',
            label: 'dashboard.controlPanel.inventory.pesticide',
            required: true,
            validations: [{ name: 'required', validator: Validators.required, message: 'common.required' }],
            options: this.pesticideOptions(),
            gridClass: 'col-span-12'
        }
    ]);

    ngOnInit(): void {
        this.loadLookups();
        this.loadReadyStocks();
    }

    openConsumeDialog(item: ReadyStockItem): void {
        this.selectedReadyStock.set(item);
        this.displayConsumeDialog = true;
    }

    hideConsumeDialog(): void {
        this.displayConsumeDialog = false;
        this.selectedReadyStock.set(null);
    }

    onQuantityCheckCancel(): void {
        this.quantityCheckResult.set(null);
    }

    onRawStockCancel(): void {
        this.rawStockResult.set(null);
    }

    submitMix(value: unknown): void {
        const formValue = this.asMixFormValue(value);
        if (!formValue) return;

        const payload: MixRequest = {
            pesticideId: formValue.pesticideId,
            pestId: formValue.pestId,
            rawQuantity: formValue.rawQuantity
        };

        this.mixSaving.set(true);
        this.inventoryService
            .mix(payload)
            .pipe(finalize(() => this.mixSaving.set(false)))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.success'),
                        detail: this.translate.instant('dashboard.controlPanel.inventory.messages.mixedSuccessfully')
                    });
                    this.loadReadyStocks();
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.error'),
                        detail: this.translate.instant('common.error')
                    });
                }
            });
    }

    submitConsume(value: unknown): void {
        const formValue = this.asConsumeFormValue(value);
        const selected = this.selectedReadyStock();
        if (!formValue || !selected) return;

        const payload: ConsumeRequest = {
            readyStockId: selected.id,
            litersUsed: formValue.litersUsed
        };

        this.confirmationService.confirm({
            message: this.translate.instant('dashboard.controlPanel.inventory.messages.confirmConsume'),
            header: this.translate.instant('common.confirmDeleteTitle'),
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: this.translate.instant('common.yes'),
            rejectLabel: this.translate.instant('common.no'),
            accept: () => {
                this.consumeSaving.set(true);
                this.inventoryService
                    .consume(payload)
                    .pipe(finalize(() => this.consumeSaving.set(false)))
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: this.translate.instant('common.success'),
                                detail: this.translate.instant('dashboard.controlPanel.inventory.messages.consumedSuccessfully')
                            });
                            this.hideConsumeDialog();
                            this.loadReadyStocks();
                        },
                        error: () => {
                            this.messageService.add({
                                severity: 'error',
                                summary: this.translate.instant('common.error'),
                                detail: this.translate.instant('common.error')
                            });
                        }
                    });
            }
        });
    }

    submitQuantityCheck(value: unknown): void {
        const formValue = this.asQuantityCheckFormValue(value);
        if (!formValue) return;

        this.quantityCheckResult.set(null);
        this.quantityCheckLoading.set(true);
        this.inventoryService
            .quantityCheck({ pesticideId: formValue.pesticideId, pestId: formValue.pestId })
            .pipe(finalize(() => this.quantityCheckLoading.set(false)))
            .subscribe({
                next: (qty) => this.quantityCheckResult.set(typeof qty === 'number' ? qty : null),
                error: () => {
                    this.quantityCheckResult.set(null);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.error'),
                        detail: this.translate.instant('common.error')
                    });
                }
            });
    }

    submitRawStock(value: unknown): void {
        const formValue = this.asRawStockFormValue(value);
        if (!formValue) return;

        this.rawStockResult.set(null);
        this.rawStockLoading.set(true);
        this.inventoryService
            .getRawStockQuantity(formValue.pesticideId)
            .pipe(finalize(() => this.rawStockLoading.set(false)))
            .subscribe({
                next: (qty) => this.rawStockResult.set(typeof qty === 'number' ? qty : null),
                error: () => {
                    this.rawStockResult.set(null);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.error'),
                        detail: this.translate.instant('common.error')
                    });
                }
            });
    }

    private loadReadyStocks(): void {
        this.readyStocksLoading.set(true);
        this.inventoryService
            .getMyReadyStocks()
            .pipe(finalize(() => this.readyStocksLoading.set(false)))
            .subscribe({
                next: (items) => this.readyStocks.set((items ?? []).map((x) => this.mapReadyStock(x))),
                error: () => this.readyStocks.set([])
            });
    }

    private loadLookups(): void {
        this.lookupsLoading.set(true);
        forkJoin({
            pesticides: this.pesticidesService.getPesticides({ PageIndex: 1, PageSize: 1000 }),
            pests: this.pestsService.getPests({ PageIndex: 1, PageSize: 1000 })
        })
            .pipe(finalize(() => this.lookupsLoading.set(false)))
            .subscribe({
                next: ({ pesticides, pests }) => {
                    this.pesticides.set(pesticides.data ?? []);
                    this.pests.set(pests.data ?? []);
                },
                error: () => {
                    this.pesticides.set([]);
                    this.pests.set([]);
                }
            });
    }

    private mapReadyStock(item: ReadyStockItem): ReadyStockItem {
        const v = item as unknown as Record<string, unknown>;
        return {
            id: v['id'] as EntityId,
            pesticideName: typeof v['pesticideName'] === 'string' ? v['pesticideName'] : '',
            pestName: typeof v['pestName'] === 'string' ? v['pestName'] : '',
            totalLitersAvailable: typeof v['totalLitersAvailable'] === 'number' ? v['totalLitersAvailable'] : 0,
            areaName: typeof v['areaName'] === 'string' ? v['areaName'] : ''
        };
    }

    private asMixFormValue(value: unknown): MixFormValue | null {
        if (!value || typeof value !== 'object') return null;
        const v = value as Record<string, unknown>;
        const pesticideId = v['pesticideId'] as EntityId | undefined;
        const pestId = v['pestId'] as EntityId | undefined;
        const rawQuantity = typeof v['rawQuantity'] === 'number' ? v['rawQuantity'] : Number(v['rawQuantity']);
        if (pesticideId === null || pesticideId === undefined || pestId === null || pestId === undefined) return null;
        if (!Number.isFinite(rawQuantity) || rawQuantity <= 0) return null;
        return { pesticideId, pestId, rawQuantity };
    }

    private asConsumeFormValue(value: unknown): ConsumeFormValue | null {
        if (!value || typeof value !== 'object') return null;
        const v = value as Record<string, unknown>;
        const litersUsed = typeof v['litersUsed'] === 'number' ? v['litersUsed'] : Number(v['litersUsed']);
        if (!Number.isFinite(litersUsed) || litersUsed <= 0) return null;
        return { litersUsed };
    }

    private asQuantityCheckFormValue(value: unknown): QuantityCheckFormValue | null {
        if (!value || typeof value !== 'object') return null;
        const v = value as Record<string, unknown>;
        const pesticideId = v['pesticideId'] as EntityId | undefined;
        const pestId = v['pestId'] as EntityId | undefined;
        if (pesticideId === null || pesticideId === undefined || pestId === null || pestId === undefined) return null;
        return { pesticideId, pestId };
    }

    private asRawStockFormValue(value: unknown): RawStockFormValue | null {
        if (!value || typeof value !== 'object') return null;
        const v = value as Record<string, unknown>;
        const pesticideId = v['pesticideId'] as EntityId | undefined;
        if (pesticideId === null || pesticideId === undefined) return null;
        return { pesticideId };
    }
}
