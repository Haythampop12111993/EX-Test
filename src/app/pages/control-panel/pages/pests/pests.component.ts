import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableComponent, Column } from '../../../../shared/components/data-table/data-table.component';

// PrimeNG Imports
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-pests',
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule, 
    ReactiveFormsModule,
    DataTableComponent,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    SelectModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './pests.component.html',
  styleUrl: './pests.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PestsComponent {
    private fb = inject(FormBuilder);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);

    loading = false;
    displayDialog = false;
    pestForm!: FormGroup;
    
    // Dropdown Options
    severityOptions = [
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' },
        { label: 'Critical', value: 'Critical' }
    ];

    statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Controlled', value: 'Controlled' },
        { label: 'Monitored', value: 'Monitored' }
    ];
    
    cols: Column[] = [
        { field: 'id', header: 'dashboard.table.headers.id' },
        { field: 'name', header: 'dashboard.controlPanel.pests.name' },
        { field: 'type', header: 'dashboard.controlPanel.pests.type' },
        { field: 'severity', header: 'dashboard.controlPanel.pests.severity' },
        { field: 'status', header: 'dashboard.table.headers.status' }
    ];

    pests = [
        { id: 'P-001', name: 'German Cockroach', type: 'Insect', severity: 'High', status: 'Active' },
        { id: 'P-002', name: 'Norway Rat', type: 'Rodent', severity: 'Critical', status: 'Active' },
        { id: 'P-003', name: 'Bed Bug', type: 'Insect', severity: 'Medium', status: 'Controlled' },
        { id: 'P-004', name: 'House Fly', type: 'Insect', severity: 'Low', status: 'Monitored' },
        { id: 'P-005', name: 'Termite', type: 'Insect', severity: 'Critical', status: 'Active' },
        { id: 'P-006', name: 'Mosquito', type: 'Insect', severity: 'High', status: 'Active' },
        { id: 'P-007', name: 'Ants', type: 'Insect', severity: 'Low', status: 'Controlled' },
        { id: 'P-008', name: 'Spider', type: 'Arachnid', severity: 'Low', status: 'Monitored' },
        { id: 'P-009', name: 'Wasp', type: 'Insect', severity: 'Medium', status: 'Active' },
        { id: 'P-010', name: 'Flea', type: 'Insect', severity: 'Medium', status: 'Active' },
        { id: 'P-011', name: 'Silverfish', type: 'Insect', severity: 'Low', status: 'Controlled' },
        { id: 'P-012', name: 'Moth', type: 'Insect', severity: 'Low', status: 'Monitored' }
    ];

    constructor() {
        this.initForm();
    }

    private initForm() {
        this.pestForm = this.fb.group({
            id: [''],
            name: ['', Validators.required],
            type: ['', Validators.required],
            severity: ['', Validators.required],
            status: ['', Validators.required]
        });
    }

    onEdit(pest: any) {
        this.pestForm.patchValue(pest);
        this.displayDialog = true;
    }

    onDelete(pest: any) {
        this.confirmationService.confirm({
            message: this.translate.instant('common.confirmDelete'),
            header: this.translate.instant('common.confirmDeleteTitle'),
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: this.translate.instant('common.yes'),
            rejectLabel: this.translate.instant('common.no'),
            acceptButtonStyleClass: 'p-button-danger p-button-text',
            rejectButtonStyleClass: 'p-button-text p-button-plain',
            accept: () => {
                this.pests = this.pests.filter(p => p.id !== pest.id);
                this.messageService.add({
                    severity: 'success', 
                    summary: this.translate.instant('common.success'), 
                    detail: this.translate.instant('common.deletedSuccessfully')
                });
            }
        });
    }

    savePest() {
        if (this.pestForm.valid) {
            const updatedPest = this.pestForm.value;
            const index = this.pests.findIndex(p => p.id === updatedPest.id);
            
            if (index !== -1) {
                this.pests[index] = updatedPest;
                this.pests = [...this.pests]; // Trigger change detection
            }
            
            this.displayDialog = false;
            this.messageService.add({
                severity: 'success', 
                summary: this.translate.instant('common.success'), 
                detail: this.translate.instant('common.savedSuccessfully')
            });
        }
    }

    hideDialog() {
        this.displayDialog = false;
    }
}
