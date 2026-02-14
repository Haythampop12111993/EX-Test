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
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { PestsService } from '../../../../core/services/pests.service';
import { EntityId, PestLookupItem } from '../../../../core/models/pest.model';
import {
    PesticideFormLookupItem,
    PesticideListItem,
    PesticideUpsertFormValue,
    TargetedPestDto,
    ToxicityLevelLookupItem
} from '../../../../core/models/pesticide.model';
import { AppPermissions } from '../../../../core/constants/permissions';

interface PesticideRow {
    id: string;
    name: string;
    activeIngredient?: string;
    toxicity?: string;
    form?: string;
    requiresSensitivityTest?: boolean;
    stockQuantity?: number;
}

@Component({
    selector: 'app-pesticides',
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
        ButtonModule,
        SelectModule,
        InputNumberModule
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './pesticides.component.html',
    styleUrl: './pesticides.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PesticidesComponent implements OnInit {
    private pesticidesService = inject(PesticidesService);
    private pestsService = inject(PestsService);
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
    pestsLookup = signal<PestLookupItem[]>([]);
    targetedPests = signal<TargetedPestDto[]>([]);
    newTargetPestId: EntityId | null = null;
    newTargetDilutionRate: number | null = null;

    selectedPesticide: Partial<Omit<PesticideUpsertFormValue, 'SensitivityTestFile'>> & {
        id?: string;
        SensitivityTestFile?: File | Blob | string;
        SensitivityTestFileUrl?: string;
    } = {};
    lastQuery = signal<DataTablePageChangeEvent | null>(null);

    cols: Column[] = [
        { field: 'id', header: 'dashboard.table.headers.id' },
        { field: 'name', header: 'dashboard.controlPanel.pesticides.name' },
        { field: 'activeIngredient', header: 'dashboard.controlPanel.pesticides.activeIngredient' },
        { field: 'toxicity', header: 'dashboard.controlPanel.pesticides.toxicity' },
        { field: 'form', header: 'dashboard.controlPanel.pesticides.form' },
        { field: 'stockQuantity', header: 'dashboard.controlPanel.pesticides.stockQuantity' }
    ];

    formConfig = computed<FieldConfig[]>(() => {
        const formOptions = this.forms().map((x) => ({ label: x.name, value: x.name }));
        const toxicityOptions = this.toxicityLevels().map((x) => ({ label: x.name, value: x.name }));

        return [
            {
                type: 'text',
                name: 'Name',
                label: 'dashboard.controlPanel.pesticides.name',
                required: true,
                validations: [{ name: 'required', validator: Validators.required, message: 'common.required' }],
                gridClass: 'col-span-12'
            },
            {
                type: 'text',
                name: 'ActiveIngredient',
                label: 'dashboard.controlPanel.pesticides.activeIngredient',
                required: true,
                validations: [{ name: 'required', validator: Validators.required, message: 'common.required' }],
                gridClass: 'col-span-12'
            },
            {
                type: 'select',
                name: 'Form',
                label: 'dashboard.controlPanel.pesticides.form',
                required: true,
                validations: [{ name: 'required', validator: Validators.required, message: 'common.required' }],
                options: formOptions,
                gridClass: 'col-span-12 md:col-span-6'
            },
            {
                type: 'select',
                name: 'Toxicity',
                label: 'dashboard.controlPanel.pesticides.toxicity',
                options: toxicityOptions,
                gridClass: 'col-span-12 md:col-span-6'
            },
            {
                type: 'checkbox',
                name: 'RequiresSensitivityTest',
                label: 'dashboard.controlPanel.pesticides.requiresSensitivityTest',
                gridClass: 'col-span-12 md:col-span-6'
            },
            {
                type: 'text',
                name: 'AllergyWarning',
                label: 'dashboard.controlPanel.pesticides.allergyWarning',
                gridClass: 'col-span-12 md:col-span-6'
            },
            {
                type: 'file',
                name: 'SensitivityTestFile',
                label: 'dashboard.controlPanel.pesticides.sensitivityTestFile',
                gridClass: 'col-span-12'
            },
            {
                type: 'number',
                name: 'Concentration',
                label: 'dashboard.controlPanel.pesticides.concentration',
                gridClass: 'col-span-12 md:col-span-6'
            },
            {
                type: 'number',
                name: 'StockQuantity',
                label: 'dashboard.controlPanel.pesticides.stockQuantity',
                gridClass: 'col-span-12 md:col-span-6'
            },
            {
                type: 'textarea',
                name: 'SafetyInstructions',
                label: 'dashboard.controlPanel.pesticides.safetyInstructions',
                gridClass: 'col-span-12'
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

        this.pestsService.getPestsLookup().subscribe({
            next: (items) => this.pestsLookup.set(items ?? []),
            error: () => this.pestsLookup.set([])
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
        this.targetedPests.set([]);
        this.newTargetPestId = null;
        this.newTargetDilutionRate = null;
        this.displayDialog = true;
    }

    onEdit(row: unknown): void {
        if (!row || typeof row !== 'object') return;
        const rawId = (row as { id?: unknown }).id;
        if (typeof rawId !== 'string' && typeof rawId !== 'number') return;

        this.loading.set(true);
        this.pesticidesService
            .getPesticideById(rawId)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (details) => {
                    this.applyDetailsToForm(details);
                    this.displayDialog = true;
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

    onDelete(row: unknown): void {
        if (!row || typeof row !== 'object') return;
        const id = (row as { id?: unknown }).id;
        const name = (row as { name?: unknown }).name;
        if (typeof id !== 'string' || !id) return;

        this.confirmationService.confirm({
            message:
                typeof name === 'string' && name
                    ? `${this.translate.instant('common.confirmDelete')} (${name})`
                    : this.translate.instant('common.confirmDelete'),
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
        const file = payload['SensitivityTestFile'];
        const requiresSensitivityTest = Boolean(payload['RequiresSensitivityTest']);

        const body: PesticideUpsertFormValue = {
            Name: String(payload['Name'] ?? ''),
            ActiveIngredient: String(payload['ActiveIngredient'] ?? ''),
            Form: String(payload['Form'] ?? ''),
            Toxicity: payload['Toxicity'] ? String(payload['Toxicity']) : undefined,
            RequiresSensitivityTest: requiresSensitivityTest,
            AllergyWarning: payload['AllergyWarning'] ? String(payload['AllergyWarning']) : undefined,
            SensitivityTestFile: requiresSensitivityTest && file instanceof Blob ? file : undefined,
            Concentration: typeof payload['Concentration'] === 'number' ? payload['Concentration'] : undefined,
            StockQuantity: typeof payload['StockQuantity'] === 'number' ? payload['StockQuantity'] : undefined,
            SafetyInstructions: payload['SafetyInstructions'] ? String(payload['SafetyInstructions']) : undefined,
            TargetPests:
                this.targetedPests().length > 0
                    ? this.targetedPests().map((x) => ({ PestId: x.pestId, DilutionRate: x.dilutionRate }))
                    : undefined
        };

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
        const activeIngredient = typeof anyItem['activeIngredient'] === 'string' ? anyItem['activeIngredient'] : undefined;
        const toxicity = typeof anyItem['toxicity'] === 'string' ? anyItem['toxicity'] : undefined;
        const form = typeof anyItem['form'] === 'string' ? anyItem['form'] : undefined;
        const requiresSensitivityTest = typeof anyItem['requiresSensitivityTest'] === 'boolean' ? anyItem['requiresSensitivityTest'] : undefined;
        const stockQuantity = typeof anyItem['stockQuantity'] === 'number' ? anyItem['stockQuantity'] : undefined;

        return {
            id,
            name,
            activeIngredient,
            toxicity,
            form,
            requiresSensitivityTest,
            stockQuantity
        };
    }

    addTargetPest(): void {
        if (this.newTargetPestId === null || this.newTargetPestId === undefined) return;
        if (this.newTargetDilutionRate === null || this.newTargetDilutionRate === undefined) return;

        const alreadyExists = this.targetedPests().some((x) => String(x.pestId) === String(this.newTargetPestId));
        if (alreadyExists) return;

        const lookupName = this.pestsLookup().find((p) => String(p.id) === String(this.newTargetPestId))?.name;
        this.targetedPests.update((current) => [
            ...current,
            { pestId: this.newTargetPestId as EntityId, dilutionRate: this.newTargetDilutionRate as number, pestName: lookupName }
        ]);

        this.newTargetPestId = null;
        this.newTargetDilutionRate = null;
    }

    removeTargetPest(pestId: EntityId): void {
        this.targetedPests.update((current) => current.filter((x) => String(x.pestId) !== String(pestId)));
    }

    onTargetDilutionChange(pestId: EntityId, value: number | null): void {
        if (value === null || value === undefined) return;
        this.targetedPests.update((current) =>
            current.map((x) => (String(x.pestId) === String(pestId) ? { ...x, dilutionRate: value } : x))
        );
    }

    pestOptions = computed(() => this.pestsLookup().map((x) => ({ label: x.name, value: x.id })));

    private applyDetailsToForm(details: PesticideListItem): void {
        const anyDetails = details as unknown as Record<string, unknown>;
        const id = typeof anyDetails['id'] === 'string' || typeof anyDetails['id'] === 'number' ? String(anyDetails['id']) : '';
        const sensitivityTestFileUrl = this.normalizeUrl(anyDetails['sensitivityTestFileUrl']);

        this.selectedPesticide = {
            id,
            Name: typeof anyDetails['name'] === 'string' ? anyDetails['name'] : '',
            ActiveIngredient: typeof anyDetails['activeIngredient'] === 'string' ? anyDetails['activeIngredient'] : '',
            Toxicity: typeof anyDetails['toxicity'] === 'string' ? anyDetails['toxicity'] : undefined,
            Form: typeof anyDetails['form'] === 'string' ? anyDetails['form'] : '',
            RequiresSensitivityTest: typeof anyDetails['requiresSensitivityTest'] === 'boolean' ? anyDetails['requiresSensitivityTest'] : false,
            AllergyWarning: typeof anyDetails['allergyWarning'] === 'string' ? anyDetails['allergyWarning'] : undefined,
            SensitivityTestFileUrl: sensitivityTestFileUrl,
            SensitivityTestFile: sensitivityTestFileUrl,
            Concentration: typeof anyDetails['concentration'] === 'number' ? anyDetails['concentration'] : undefined,
            StockQuantity: typeof anyDetails['stockQuantity'] === 'number' ? anyDetails['stockQuantity'] : undefined,
            SafetyInstructions: typeof anyDetails['safetyInstructions'] === 'string' ? anyDetails['safetyInstructions'] : undefined
        };

        const targeted = anyDetails['targetedPestsDto'];
        this.targetedPests.set(Array.isArray(targeted) ? (targeted as TargetedPestDto[]) : []);
        this.newTargetPestId = null;
        this.newTargetDilutionRate = null;
    }

    private normalizeUrl(value: unknown): string | undefined {
        if (typeof value !== 'string') return undefined;
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        return trimmed.replace(/`/g, '').trim();
    }
}
