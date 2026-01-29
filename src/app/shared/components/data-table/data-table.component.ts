import { Component, Input, ViewChild, ChangeDetectionStrategy, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';

export interface Column {
    field: string;
    header: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, TooltipModule, TranslateModule, HasPermissionDirective],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent {
    @Input() data: any[] = [];
    @Input() cols: Column[] = [];
    @Input() title: string = '';
    @Input() loading: boolean = false;
    @Input() tableId: string = 'default-table'; // Unique ID for session storage
    @Input() showAddButton: boolean = false;
    @Input() showEditButton: boolean = true;
    @Input() showDeleteButton: boolean = true;
    @Input() showPermissionsButton: boolean = false;

    // Permissions Inputs
    @Input() addPermission?: string;
    @Input() editPermission?: string;
    @Input() deletePermission?: string;
    @Input() permissionsPermission?: string;
    
    @Output() edit = new EventEmitter<any>();
    @Output() delete = new EventEmitter<any>();
    @Output() permissions = new EventEmitter<any>();
    @Output() add = new EventEmitter<void>();

    first: number = 0;
    rows: number = 10;

    @ViewChild('dt') dt!: Table;

    private translate = inject(TranslateService);

    getGlobalFilterFields(): string[] {
        return this.cols.map(col => col.field);
    }

    getStatusClass(value: any, field: string): string {
        if (!value || (field !== 'status' && field !== 'severity')) return '';
        
        const lowerValue = String(value).toLowerCase();
        
        if (field === 'status') {
            if (lowerValue === 'active' || lowerValue === 'completed') return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
            if (lowerValue === 'pending' || lowerValue === 'monitored') return 'bg-amber-50 text-amber-600 border border-amber-100';
            if (lowerValue === 'inactive' || lowerValue === 'controlled') return 'bg-slate-100 text-slate-500 border border-slate-200';
            return 'bg-slate-50 text-slate-600';
        }
        
        if (field === 'severity') {
            if (lowerValue === 'high' || lowerValue === 'critical') return 'bg-rose-50 text-rose-600 border border-rose-100';
            if (lowerValue === 'medium') return 'bg-orange-50 text-orange-600 border border-orange-100';
            if (lowerValue === 'low') return 'bg-blue-50 text-blue-600 border border-blue-100';
            return 'bg-slate-50 text-slate-600';
        }

        return '';
    }

    getDisplayValue(value: any): string {
        if (value === null || value === undefined || value === '') {
            return this.translate.instant('common.noValue');
        }
        
        if (Array.isArray(value) && value.length === 0) {
            return this.translate.instant('common.noValue');
        }

        const stringValue = String(value);
        if (stringValue.trim().toLowerCase() === 'n/a') {
            return this.translate.instant('common.noValue');
        }

        return stringValue;
    }

    exportExcel() {
        if (!this.data || this.data.length === 0) return;

        const exportData = this.data.map(item => {
            const newItem: Record<string, any> = {};
            this.cols.forEach(col => {
                const header = this.translate.instant(col.header);
                newItem[header] = item[col.field];
            });
            return newItem;
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, this.title || 'export');
    }

    private saveAsExcelFile(buffer: any, fileName: string): void {
        const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const EXCEL_EXTENSION = '.xlsx';
        const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
        FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    }
}
