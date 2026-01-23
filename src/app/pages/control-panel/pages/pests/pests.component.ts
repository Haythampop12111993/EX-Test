import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Validators } from '@angular/forms';
import { DataTableComponent, Column } from '../../../../shared/components/data-table/data-table.component';
import { DynamicFormComponent } from '../../../../shared/components/dynamic-form/dynamic-form.component';
import { FieldConfig } from '../../../../shared/models/field-config.interface';

// PrimeNG Imports
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

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
export class PestsComponent {
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);

    loading = false;
    displayDialog = false;
    selectedPest: any = {};
    
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

    formConfig: FieldConfig[] = [
        {
            type: 'text',
            name: 'name',
            label: 'dashboard.controlPanel.pests.name',
            required: true,
            validations: [
                { name: 'required', validator: Validators.required, message: 'common.required' }
            ],
            gridClass: 'col-span-12'
        },
        {
            type: 'text',
            name: 'type',
            label: 'dashboard.controlPanel.pests.type',
            required: true,
            validations: [
                { name: 'required', validator: Validators.required, message: 'common.required' }
            ],
            gridClass: 'col-span-12'
        },
        {
            type: 'select',
            name: 'severity',
            label: 'dashboard.controlPanel.pests.severity',
            required: true,
            options: [
                { label: 'High', value: 'High' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Low', value: 'Low' },
                { label: 'Critical', value: 'Critical' }
            ],
            validations: [
                { name: 'required', validator: Validators.required, message: 'common.required' }
            ],
            gridClass: 'col-span-12'
        },
        {
            type: 'select',
            name: 'status',
            label: 'dashboard.table.headers.status',
            required: true,
            options: [
                { label: 'Active', value: 'Active' },
                { label: 'Controlled', value: 'Controlled' },
                { label: 'Monitored', value: 'Monitored' }
            ],
            validations: [
                { name: 'required', validator: Validators.required, message: 'common.required' }
            ],
            gridClass: 'col-span-12'
        },
        {
            type: 'file',
            name: 'image',
            label: 'dashboard.controlPanel.pests.image',
            accept: 'image/*',
            gridClass: 'col-span-12'
        }
    ];

    onAdd() {
        this.selectedPest = {};
        this.displayDialog = true;
    }

    onEdit(pest: any) {
        this.selectedPest = { ...pest };
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

    savePest(formData: any) {
        console.log('Form Data Submitted:', formData);
        if (this.selectedPest.id) {
            // Edit existing
            const updatedPest = { ...this.selectedPest, ...formData };
            const index = this.pests.findIndex(p => p.id === updatedPest.id);
            
            if (index !== -1) {
                this.pests[index] = updatedPest;
                this.pests = [...this.pests]; // Trigger change detection
            }
        } else {
            // Add new
            const newPest = {
                id: 'P-' + String(this.pests.length + 1).padStart(3, '0'),
                ...formData,
                severity: formData.severity || 'Low', // Default values if not selected
                status: formData.status || 'Active'
            };
            this.pests = [...this.pests, newPest];
        }
        
        this.displayDialog = false;
        this.messageService.add({
            severity: 'success', 
            summary: this.translate.instant('common.success'), 
            detail: this.translate.instant('common.savedSuccessfully')
        });
    }

    hideDialog() {
        this.displayDialog = false;
    }
}
