import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { finalize } from 'rxjs';
import { DataTableComponent, Column } from '../../../../shared/components/data-table/data-table.component';
import { DynamicFormComponent } from '../../../../shared/components/dynamic-form/dynamic-form.component';
import { FieldConfig } from '../../../../shared/models/field-config.interface';
import { AppPermissions } from '../../../../core/constants/permissions';
import { AreasService } from '../../../../core/services/areas.service';
import { RegionsService } from '../../../../core/services/regions.service';
import { Area, AreaCreateRequest, EntityId, Region } from '../../../../core/models/geo.model';

interface AreaRow {
    id: EntityId;
    name: string;
    regionId?: EntityId;
    regionName?: string;
}

interface AreaFormValue {
    name: string;
    regionId: EntityId;
}

interface RegionFormValue {
    name: string;
}

@Component({
    selector: 'app-areas',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        DataTableComponent,
        DynamicFormComponent,
        DialogModule,
        ConfirmDialogModule,
        ToastModule,
        SelectModule,
        ButtonModule,
        TabsModule
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './areas.component.html',
    styleUrl: './areas.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AreasComponent implements OnInit {
    private areasService = inject(AreasService);
    private regionsService = inject(RegionsService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);

    protected readonly AppPermissions = AppPermissions;

    loading = signal(false);
    saving = signal(false);
    regionsLoading = signal(false);
    regionsSaving = signal(false);

    regions = signal<Region[]>([]);
    areas = signal<AreaRow[]>([]);

    displayDialog = false;
    selectedArea: Partial<AreaRow> = {};

    displayRegionDialog = false;
    selectedRegion: Partial<Region> = {};

    filterRegionId = signal<EntityId | null>(null);

    cols: Column[] = [
        { field: 'id', header: 'dashboard.table.headers.id' },
        { field: 'name', header: 'dashboard.controlPanel.areas.name' },
        { field: 'regionName', header: 'dashboard.controlPanel.areas.regionName' }
    ];

    regionCols: Column[] = [
        { field: 'id', header: 'dashboard.table.headers.id' },
        { field: 'name', header: 'dashboard.controlPanel.regions.name' }
    ];

    regionOptions = computed(() => [
        { label: this.translate.instant('common.all'), value: null },
        ...this.regions().map((r) => ({ label: r.name, value: r.id }))
    ]);

    formConfig = computed<FieldConfig[]>(() => [
        {
            type: 'text',
            name: 'name',
            label: 'dashboard.controlPanel.areas.name',
            required: true,
            validations: [{ name: 'required', validator: Validators.required, message: 'common.required' }],
            gridClass: 'col-span-12 md:col-span-6'
        },
        {
            type: 'select',
            name: 'regionId',
            label: 'dashboard.controlPanel.areas.region',
            required: true,
            validations: [{ name: 'required', validator: Validators.required, message: 'common.required' }],
            options: this.regions().map((r) => ({ label: r.name, value: r.id })),
            gridClass: 'col-span-12 md:col-span-6'
        }
    ]);

    regionFormConfig = computed<FieldConfig[]>(() => [
        {
            type: 'text',
            name: 'name',
            label: 'dashboard.controlPanel.regions.name',
            required: true,
            validations: [{ name: 'required', validator: Validators.required, message: 'common.required' }],
            gridClass: 'col-span-12'
        }
    ]);

    ngOnInit(): void {
        this.loadRegions();
        this.loadAreas();
    }

    onAdd(): void {
        this.selectedArea = {};
        const regionId = this.filterRegionId();
        if (regionId != null) this.selectedArea.regionId = regionId;
        this.displayDialog = true;
    }

    onEdit(row: unknown): void {
        const area = this.asAreaRow(row);
        if (!area) return;
        this.selectedArea = { ...area };
        this.displayDialog = true;
    }

    onDelete(row: unknown): void {
        const area = this.asAreaRow(row);
        if (!area) return;

        this.confirmationService.confirm({
            message: area.name ? `${this.translate.instant('common.confirmDelete')} (${area.name})` : this.translate.instant('common.confirmDelete'),
            header: this.translate.instant('common.confirmDeleteTitle'),
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: this.translate.instant('common.yes'),
            rejectLabel: this.translate.instant('common.no'),
            accept: () => {
                this.areasService.deleteArea(area.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.success'),
                            detail: this.translate.instant('common.deletedSuccessfully')
                        });
                        this.loadAreas();
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

    onFilterRegionChange(value: EntityId | null): void {
        this.filterRegionId.set(value);
        this.loadAreas();
    }

    saveArea(value: unknown): void {
        const formValue = this.asAreaFormValue(value);
        if (!formValue) return;

        const regionName = this.regions().find((r) => String(r.id) === String(formValue.regionId))?.name;
        const payload: AreaCreateRequest = {
            name: formValue.name,
            regionId: formValue.regionId,
            regionName
        };

        this.saving.set(true);
        const save$ = this.selectedArea.id != null ? this.areasService.updateArea(this.selectedArea.id, payload) : this.areasService.createArea(payload);

        save$.pipe(finalize(() => this.saving.set(false))).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('common.success'),
                    detail: this.translate.instant('common.savedSuccessfully')
                });
                this.displayDialog = false;
                this.loadAreas();
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

    hideDialog(): void {
        this.displayDialog = false;
    }

    onAddRegion(): void {
        this.selectedRegion = {};
        this.displayRegionDialog = true;
    }

    onEditRegion(row: unknown): void {
        const region = this.asRegion(row);
        if (!region) return;
        this.selectedRegion = { ...region };
        this.displayRegionDialog = true;
    }

    onDeleteRegion(row: unknown): void {
        const region = this.asRegion(row);
        if (!region) return;

        this.confirmationService.confirm({
            message: region.name ? `${this.translate.instant('common.confirmDelete')} (${region.name})` : this.translate.instant('common.confirmDelete'),
            header: this.translate.instant('common.confirmDeleteTitle'),
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: this.translate.instant('common.yes'),
            rejectLabel: this.translate.instant('common.no'),
            accept: () => {
                this.regionsService.deleteRegion(region.id).subscribe({
                    next: () => {
                        if (this.filterRegionId() != null && String(this.filterRegionId()) === String(region.id)) {
                            this.filterRegionId.set(null);
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.success'),
                            detail: this.translate.instant('common.deletedSuccessfully')
                        });
                        this.loadRegions();
                        this.loadAreas();
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

    saveRegion(value: unknown): void {
        const formValue = this.asRegionFormValue(value);
        if (!formValue) return;

        this.regionsSaving.set(true);
        const save$ =
            this.selectedRegion.id != null
                ? this.regionsService.updateRegion(this.selectedRegion.id, { name: formValue.name })
                : this.regionsService.createRegion({ name: formValue.name });

        save$.pipe(finalize(() => this.regionsSaving.set(false))).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('common.success'),
                    detail: this.translate.instant('common.savedSuccessfully')
                });
                this.displayRegionDialog = false;
                this.loadRegions();
                this.loadAreas();
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

    hideRegionDialog(): void {
        this.displayRegionDialog = false;
    }

    private loadRegions(): void {
        this.regionsLoading.set(true);
        this.regionsService
            .getRegions()
            .pipe(finalize(() => this.regionsLoading.set(false)))
            .subscribe({
                next: (items) => this.regions.set(items ?? []),
                error: () => this.regions.set([])
            });
    }

    private loadAreas(): void {
        this.loading.set(true);
        this.areasService
            .getAreas(this.filterRegionId() ?? undefined)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (items) => this.areas.set((items ?? []).map((x) => this.mapApiAreaToRow(x))),
                error: () => {
                    this.areas.set([]);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.error'),
                        detail: this.translate.instant('common.error')
                    });
                }
            });
    }

    private mapApiAreaToRow(item: Area): AreaRow {
        const anyItem = item as unknown as Record<string, unknown>;
        return {
            id: anyItem['id'] as EntityId,
            name: typeof anyItem['name'] === 'string' ? anyItem['name'] : '',
            regionId: anyItem['regionId'] as EntityId | undefined,
            regionName: typeof anyItem['regionName'] === 'string' ? anyItem['regionName'] : undefined
        };
    }

    private asAreaRow(value: unknown): AreaRow | null {
        if (!value || typeof value !== 'object') return null;
        const v = value as Record<string, unknown>;
        const id = v['id'];
        if (id === null || id === undefined) return null;
        const name = typeof v['name'] === 'string' ? v['name'] : '';
        return {
            id: id as EntityId,
            name,
            regionId: v['regionId'] as EntityId | undefined,
            regionName: typeof v['regionName'] === 'string' ? v['regionName'] : undefined
        };
    }

    private asAreaFormValue(value: unknown): AreaFormValue | null {
        if (!value || typeof value !== 'object') return null;
        const v = value as Record<string, unknown>;
        const name = typeof v['name'] === 'string' ? v['name'].trim() : '';
        const regionId = v['regionId'] as EntityId | undefined;
        if (!name || regionId === null || regionId === undefined || regionId === '') return null;
        return { name, regionId };
    }

    private asRegion(value: unknown): Region | null {
        if (!value || typeof value !== 'object') return null;
        const v = value as Record<string, unknown>;
        const id = v['id'];
        if (id === null || id === undefined) return null;
        const name = typeof v['name'] === 'string' ? v['name'] : '';
        return { id: id as EntityId, name };
    }

    private asRegionFormValue(value: unknown): RegionFormValue | null {
        if (!value || typeof value !== 'object') return null;
        const v = value as Record<string, unknown>;
        const name = typeof v['name'] === 'string' ? v['name'].trim() : '';
        if (!name) return null;
        return { name };
    }
}
