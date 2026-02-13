import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { DataTableComponent, Column, DataTablePageChangeEvent } from '../../../../shared/components/data-table/data-table.component';
import { DynamicFormComponent } from '../../../../shared/components/dynamic-form/dynamic-form.component';
import { FieldConfig } from '../../../../shared/models/field-config.interface';
import { PesticidesService } from '../../../../core/services/pesticides.service';
import { PesticideFormLookupItem, PesticideListItem, PesticideUpsertFormValue, ToxicityLevelLookupItem } from '../../../../core/models/pesticide.model';
import { AppPermissions } from '../../../../core/constants/permissions';

interface PesticideRow {
    id: string;
    name: string;
    typeName?: string;
    formName?: string;
    toxicityLevelName?: string;
    typeId?: string | number;
    formId?: string | number;
    toxicityLevelId?: string | number;
}

@Component({
    selector: 'app-pesticides',
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
    templateUrl: './pesticides.component.html',
    styleUrl: './pesticides.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PesticidesComponent implements OnInit {
    private pesticidesService = inject(PesticidesService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);

    protected readonly AppPermissions = AppPermissions;

    loading = signal(false);
    saving = signal(false);
    displayDialog = false;

    pesticides = signal<PesticideRow[]>([]);
    totalRecords = signal(0);

    forms = signal<PesticideFormLookupItem[]>([]);
    toxicityLevels = signal<ToxicityLevelLookupItem[]>([]);

    selectedPesticide: Partial<PesticideRow> = {};
    lastQuery = signal<DataTablePageChangeEvent | null>(null);

    cols: Column[] = [
        { field: 'id', header: 'dashboard.table.headers.id' },
        { field: 'name', header: 'dashboard.controlPanel.pesticides.name' },
        { field: 'typeName', header: 'dashboard.controlPanel.pesticides.type' },
        { field: 'formName', header: 'dashboard.controlPanel.pesticides.form' },
        { field: 'toxicityLevelName', header: 'dashboard.controlPanel.pesticides.toxicityLevel' }
    ];

    formConfig = computed<FieldConfig[]>(() => {
        const formOptions = this.forms().map((x) => ({ label: x.name, value: x.id }));
        const toxicityOptions = this.toxicityLevels().map((x) => ({ label: x.name, value: x.id }));

        return [
            {
                type: 'text',
                name: 'name',
                label: 'dashboard.controlPanel.pesticides.name',
                required: true,
                validations: [{ name: 'required', validator: Validators.required, message: 'common.required' }],
                gridClass: 'col-span-12'
            },
            {
                type: 'select',
                name: 'formId',
                label: 'dashboard.controlPanel.pesticides.form',
                options: formOptions,
                gridClass: 'col-span-12 md:col-span-6'
            },
            {
                type: 'select',
                name: 'toxicityLevelId',
                label: 'dashboard.controlPanel.pesticides.toxicityLevel',
                options: toxicityOptions,
                gridClass: 'col-span-12 md:col-span-6'
            }
        ];
    });

    ngOnInit(): void {
        this.pesticidesService.getForms().subscribe({
            next: (forms) => this.forms.set(forms ?? []),
            error: () => this.forms.set([])
        });

        this.pesticidesService.getToxicityLevels().subscribe({
            next: (levels) => this.toxicityLevels.set(levels ?? []),
            error: () => this.toxicityLevels.set([])
        });
    }

    onPageChange(event: DataTablePageChangeEvent): void {
        this.lastQuery.set(event);
        this.loading.set(true);
        this.pesticidesService
            .getPesticides({ PageIndex: event.pageIndex, PageSize: event.pageSize, Search: event.search })
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (paged) => {
                    this.pesticides.set((paged.data ?? []).map((p) => this.mapApiToRow(p)));
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

    onAdd(): void {
        this.selectedPesticide = {};
        this.displayDialog = true;
    }

    onEdit(row: unknown): void {
        if (!row || typeof row !== 'object') return;
        this.selectedPesticide = { ...(row as PesticideRow) };
        this.displayDialog = true;
    }

    onDelete(row: unknown): void {
        if (!row || typeof row !== 'object') return;
        const id = (row as { id?: unknown }).id;
        if (typeof id !== 'string' || !id) return;

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
                this.pesticidesService
                    .deletePesticide(id)
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

    savePesticide(payload: Record<string, unknown>): void {
        const id = this.selectedPesticide.id;
        const body = payload as PesticideUpsertFormValue;

        this.saving.set(true);
        const req$ =
            typeof id === 'string' && id
                ? this.pesticidesService.updatePesticide(id, body)
                : this.pesticidesService.createPesticide(body);

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

    hideDialog(): void {
        this.displayDialog = false;
    }

    private reload(): void {
        const q = this.lastQuery();
        if (!q) return;
        this.onPageChange(q);
    }

    private mapApiToRow(item: PesticideListItem): PesticideRow {
        const anyItem = item as unknown as Record<string, unknown>;
        const id = typeof anyItem['id'] === 'string' || typeof anyItem['id'] === 'number' ? String(anyItem['id']) : '';
        const name = typeof anyItem['name'] === 'string' ? anyItem['name'] : '';
        const typeName = typeof anyItem['typeName'] === 'string' ? anyItem['typeName'] : undefined;
        const formName = typeof anyItem['formName'] === 'string' ? anyItem['formName'] : undefined;
        const toxicityLevelName = typeof anyItem['toxicityLevelName'] === 'string' ? anyItem['toxicityLevelName'] : undefined;
        const typeId = typeof anyItem['typeId'] === 'string' || typeof anyItem['typeId'] === 'number' ? (anyItem['typeId'] as string | number) : undefined;
        const formId = typeof anyItem['formId'] === 'string' || typeof anyItem['formId'] === 'number' ? (anyItem['formId'] as string | number) : undefined;
        const toxicityLevelId =
            typeof anyItem['toxicityLevelId'] === 'string' || typeof anyItem['toxicityLevelId'] === 'number'
                ? (anyItem['toxicityLevelId'] as string | number)
                : undefined;

        return {
            id,
            name,
            typeName,
            formName,
            toxicityLevelName,
            typeId,
            formId,
            toxicityLevelId
        };
    }
}
