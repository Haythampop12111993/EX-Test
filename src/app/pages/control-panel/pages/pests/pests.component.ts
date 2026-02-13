import { Component, ChangeDetectionStrategy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { DataTableComponent, Column, DataTablePageChangeEvent } from '../../../../shared/components/data-table/data-table.component';
import { DynamicFormComponent } from '../../../../shared/components/dynamic-form/dynamic-form.component';
import { FieldConfig } from '../../../../shared/models/field-config.interface';
import { Pest } from '../../../../shared/models/pest.interface';
import { PestsService } from '../../../../core/services/pests.service';
import { EntityId, PestCreateRequest, PestListItem, PestLookupItem } from '../../../../core/models/pest.model';
import { AppPermissions } from '../../../../core/constants/permissions';

// PrimeNG Imports
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

interface PestRow {
    id: string;
    name: string;
    scientificName?: string;
    description?: string;
    type?: string;
    typeId?: EntityId;
    parentPestId?: EntityId | null;
    parentName?: string | null;
    pesticidesCount?: number;
    severity?: Pest['severity'];
    status?: Pest['status'];
    image?: Pest['image'];
}

@Component({
  selector: 'app-pests',
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule, 
    DataTableComponent,
    DynamicFormComponent,
    DialogModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './pests.component.html',
  styleUrl: './pests.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PestsComponent implements OnInit {
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private pestsService = inject(PestsService);

    protected readonly AppPermissions = AppPermissions;

    loading = signal(false);
    saving = signal(false);
    displayDialog = false;

    pests = signal<PestRow[]>([]);
    totalRecords = signal(0);
    parents = signal<PestLookupItem[]>([]);
    selectedPest: Partial<PestRow> = {};
    lastQuery = signal<DataTablePageChangeEvent | null>(null);
    
    cols: Column[] = [
        { field: 'id', header: 'dashboard.table.headers.id' },
        { field: 'name', header: 'dashboard.controlPanel.pests.commonName' },
        { field: 'scientificName', header: 'dashboard.controlPanel.pests.name' },
        { field: 'type', header: 'dashboard.controlPanel.pests.type' },
        { field: 'parentName', header: 'dashboard.controlPanel.pests.parent' },
        { field: 'pesticidesCount', header: 'dashboard.controlPanel.pests.pesticidesCount' }
    ];

    formConfig = computed<FieldConfig[]>(() => {
        const parentOptions = this.parents().map((x) => ({ label: x.name, value: x.id }));

        return [
            {
                type: 'text',
                name: 'name',
                label: 'dashboard.controlPanel.pests.commonName',
                required: true,
                validations: [{ name: 'required', validator: Validators.required, message: 'common.required' }],
                gridClass: 'col-span-12 md:col-span-6'
            },
            {
                type: 'text',
                name: 'scientificName',
                label: 'dashboard.controlPanel.pests.name',
                gridClass: 'col-span-12 md:col-span-6'
            },
            {
                type: 'text',
                name: 'type',
                label: 'dashboard.controlPanel.pests.type',
                gridClass: 'col-span-12 md:col-span-6'
            },
            {
                type: 'select',
                name: 'parentPestId',
                label: 'dashboard.controlPanel.pests.parent',
                options: parentOptions,
                gridClass: 'col-span-12 md:col-span-6'
            },
            {
                type: 'textarea',
                name: 'description',
                label: 'dashboard.table.headers.description',
                gridClass: 'col-span-12'
            }
        ];
    });

    ngOnInit(): void {
        this.pestsService.getPestsLookup().subscribe({
            next: (items) => this.parents.set(items ?? []),
            error: () => this.parents.set([])
        });
    }

    onAdd() {
        this.selectedPest = {};
        this.displayDialog = true;
    }

    onEdit(pest: unknown) {
        if (!this.isPest(pest)) return;
        this.selectedPest = { ...pest };
        this.displayDialog = true;
    }

    onDelete(pest: unknown) {
        if (!this.isPest(pest)) return;
        this.confirmationService.confirm({
            message: this.translate.instant('common.confirmDelete'),
            header: this.translate.instant('common.confirmDeleteTitle'),
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: this.translate.instant('common.yes'),
            rejectLabel: this.translate.instant('common.no'),
            acceptButtonStyleClass: 'p-button-danger p-button-text',
            rejectButtonStyleClass: 'p-button-text p-button-plain',
            accept: () => {
                this.loading.set(true);
                this.pestsService
                    .deletePest(pest.id)
                    .pipe(finalize(() => this.loading.set(false)))
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: this.translate.instant('common.success'),
                                detail: this.translate.instant('common.deletedSuccessfully')
                            });
                            this.reload();
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

    savePest(formData: Record<string, unknown>) {
        const id = this.selectedPest.id;

        const rawParentPestId = formData['parentPestId'];
        const parentPestId: EntityId | null | undefined =
            rawParentPestId === '' || rawParentPestId === undefined ? 0 : (rawParentPestId as EntityId | null | undefined);

        const body: PestCreateRequest = {
            name: typeof formData['name'] === 'string' ? formData['name'] : String(formData['name'] ?? ''),
            scientificName: typeof formData['scientificName'] === 'string' ? formData['scientificName'] : undefined,
            type: typeof formData['type'] === 'string' ? formData['type'] : undefined,
            description: typeof formData['description'] === 'string' ? formData['description'] : undefined,
            parentPestId
        };

        this.saving.set(true);
        const req$ = id ? this.pestsService.updatePest(id, body) : this.pestsService.createPest(body);

        req$.pipe(finalize(() => this.saving.set(false))).subscribe({
            next: () => {
                this.displayDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('common.success'),
                    detail: this.translate.instant('common.savedSuccessfully')
                });
                this.reload();
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

    hideDialog() {
        this.displayDialog = false;
    }

    private isPest(value: unknown): value is { id: string; name: string } {
        if (!value || typeof value !== 'object') return false;
        const maybe = value as Partial<{ id: unknown; name: unknown }>;
        return typeof maybe.id === 'string' && typeof maybe.name === 'string';
    }

    onPageChange(event: DataTablePageChangeEvent): void {
        this.lastQuery.set(event);
        this.loadPests(event);
    }

    private loadPests(event: DataTablePageChangeEvent): void {
        this.loading.set(true);
        this.pestsService
            .getPests({ PageIndex: event.pageIndex, PageSize: event.pageSize, Search: event.search })
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (paged) => {
                    this.pests.set(paged.data.map((p) => this.mapApiPestToRow(p)));
                    this.totalRecords.set(paged.count ?? 0);
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

    private reload(): void {
        const q = this.lastQuery();
        if (q) {
            this.loadPests(q);
            return;
        }
        this.loadPests({ pageIndex: 1, pageSize: 10 });
    }

    private mapApiPestToRow(pest: PestListItem): PestRow {
        const anyPest = pest as unknown as Record<string, unknown>;
        const id = typeof anyPest['id'] === 'string' || typeof anyPest['id'] === 'number' ? String(anyPest['id']) : '';
        const name = typeof anyPest['name'] === 'string' ? anyPest['name'] : '';
        const scientificName = typeof anyPest['scientificName'] === 'string' ? anyPest['scientificName'] : undefined;
        const description = typeof anyPest['description'] === 'string' ? anyPest['description'] : undefined;
        const typeName = typeof anyPest['typeName'] === 'string' ? anyPest['typeName'] : undefined;
        const type = typeof anyPest['type'] === 'string' ? anyPest['type'] : typeName;
        const typeId = typeof anyPest['typeId'] === 'string' || typeof anyPest['typeId'] === 'number' ? (anyPest['typeId'] as EntityId) : undefined;
        const parentPestId =
            typeof anyPest['parentPestId'] === 'string' || typeof anyPest['parentPestId'] === 'number'
                ? (anyPest['parentPestId'] as EntityId)
                : typeof anyPest['parentId'] === 'string' || typeof anyPest['parentId'] === 'number'
                  ? (anyPest['parentId'] as EntityId)
                  : anyPest['parentPestId'] === null || anyPest['parentId'] === null
                    ? null
                    : undefined;
        const parentName = typeof anyPest['parentName'] === 'string' ? anyPest['parentName'] : null;
        const pesticides = anyPest['pesticides'];
        const pesticidesCount = Array.isArray(pesticides) ? pesticides.length : undefined;
        const severity = typeof anyPest['severity'] === 'string' ? (anyPest['severity'] as Pest['severity']) : undefined;
        const status = typeof anyPest['status'] === 'string' ? (anyPest['status'] as Pest['status']) : undefined;
        const image = anyPest['image'] as Pest['image'];

        return {
            id,
            name,
            scientificName,
            description,
            type,
            typeId,
            parentPestId,
            parentName,
            pesticidesCount,
            severity,
            status,
            image
        };
    }
}
