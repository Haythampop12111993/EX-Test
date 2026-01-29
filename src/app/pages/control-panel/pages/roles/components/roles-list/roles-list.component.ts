import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, Column } from '../../../../../../shared/components/data-table/data-table.component';
import { Role } from '../../../../../../core/models/role.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent, TranslateModule],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesListComponent {
  @Input() roles: Role[] = [];
  @Input() loading: boolean = false;
  
  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Role>();
  @Output() delete = new EventEmitter<Role>();
  @Output() managePermissions = new EventEmitter<Role>();

  cols: Column[] = [
    { field: 'name', header: 'dashboard.table.headers.roleName' }
  ];
}
