import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableComponent, Column } from '../../../../../../shared/components/data-table/data-table.component';
import { User } from '../../../../../../core/models/user.model';
import { AppPermissions } from '../../../../../../core/constants/permissions';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent, TranslateModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersListComponent {
  @Input() users: User[] = [];
  @Input() loading: boolean = false;
  
  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<User>();
  @Output() delete = new EventEmitter<User>();

  // Expose permissions to template
  readonly permissions = AppPermissions;

  cols: Column[] = [
    { field: 'fullName', header: 'dashboard.users.table.fullName' },
    { field: 'email', header: 'dashboard.users.table.email' },
    { field: 'phoneNumber', header: 'dashboard.users.table.phoneNumber' },
    { field: 'roles', header: 'dashboard.users.table.roles' },
    { field: 'areaName', header: 'dashboard.users.table.area' }
  ];
}
