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

export interface DataTablePageChangeEvent {
    pageIndex: number;
    pageSize: number;
    search?: string;
    sortField?: string;
    sortOrder?: 1 | -1;
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
    @Input() data: unknown[] = [];
    @Input() cols: Column[] = [];
    @Input() title = '';
    @Input() loading = false;
    @Input() tableId = 'default-table';
    @Input() showAddButton = false;
    @Input() showEditButton = true;
    @Input() showDeleteButton = true;
    @Input() showPermissionsButton = false;
    @Input() serverPagination = false;
    @Input() totalRecords?: number;
    @Input() rowsPerPageOptions: number[] = [5, 10, 25, 50, 100, 1000];

    // Permissions Inputs
    @Input() addPermission?: string;
    @Input() editPermission?: string;
    @Input() deletePermission?: string;
    @Input() permissionsPermission?: string;
    
    @Output() edit = new EventEmitter<unknown>();
    @Output() delete = new EventEmitter<unknown>();
    @Output() permissions = new EventEmitter<unknown>();
    @Output() add = new EventEmitter<void>();
    @Output() pageChange = new EventEmitter<DataTablePageChangeEvent>();

    first = 0;
    rows = 10;

    @ViewChild('dt') dt!: Table;

    private translate = inject(TranslateService);

    onLazyLoad(event: unknown): void {
        const e = event as Partial<Record<string, unknown>>;

        const first = typeof e['first'] === 'number' ? e['first'] : 0;
        const rows = typeof e['rows'] === 'number' ? e['rows'] : this.rows;
        const sortField = typeof e['sortField'] === 'string' ? e['sortField'] : undefined;
        const sortOrder = e['sortOrder'] === 1 || e['sortOrder'] === -1 ? (e['sortOrder'] as 1 | -1) : undefined;

        const filters = e['filters'] as Record<string, unknown> | undefined;
        const global = filters?.['global'] as Record<string, unknown> | undefined;
        const search = typeof global?.['value'] === 'string' ? global['value'] : undefined;

        this.first = first;
        this.rows = rows;

        this.pageChange.emit({
            pageIndex: Math.floor(first / rows) + 1,
            pageSize: rows,
            search,
            sortField,
            sortOrder
        });
    }

    getTotalRecords(): number {
        if (typeof this.totalRecords === 'number') return this.totalRecords;
        return this.data?.length ?? 0;
    }

    getGlobalFilterFields(): string[] {
        return this.cols.map(col => col.field);
    }

    getStatusClass(value: unknown, field: string): string {
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

    getDisplayValue(value: unknown): string {
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
            const newItem: Record<string, unknown> = {};
            const row = item as Record<string, unknown>;
            this.cols.forEach(col => {
                const header = this.translate.instant(col.header);
                newItem[header] = row[col.field];
            });
            return newItem;
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
        this.saveAsExcelFile(excelBuffer, this.title || 'export');
    }

    private saveAsExcelFile(buffer: ArrayBuffer, fileName: string): void {
        const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const EXCEL_EXTENSION = '.xlsx';
        const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
        FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    }
}
