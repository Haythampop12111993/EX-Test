import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RolesListComponent } from './components/roles-list/roles-list.component';
import { RolesFormComponent } from './components/roles-form/roles-form.component';
import { ManagePermissionsComponent } from './components/manage-permissions/manage-permissions.component';
import { RolesService } from '../../../../core/services/roles.service';
import { Role } from '../../../../core/models/role.model';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, TranslateModule, RolesListComponent, RolesFormComponent, ManagePermissionsComponent],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesComponent {
  private rolesService = inject(RolesService);
  private messageService = inject(MessageService);

  viewState = signal<'list' | 'form' | 'permissions'>('list');
  selectedRole = signal<Role | null>(null);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);

  roles = signal<Role[]>([]);

  constructor() {
    this.loadRoles();
  }

  loadRoles() {
    this.loading.set(true);
    this.rolesService.getRoles()
      .pipe(
        finalize(() => this.loading.set(false)),
        catchError(err => {
          console.error('Failed to load roles', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load roles' });
          return of([]);
        })
      )
      .subscribe(data => this.roles.set(data));
  }

  onAdd() {
    this.selectedRole.set(null);
    this.viewState.set('form');
  }

  onEdit(role: Role) {
    // Edit is not supported by API
    this.messageService.add({ severity: 'info', summary: 'Info', detail: `Edit is not supported for role "${role.name}"` });
  }

  onManagePermissions(role: Role) {
    this.selectedRole.set(role);
    this.viewState.set('permissions');
  }

  onDelete(role: Role) {
    if (confirm('Are you sure you want to delete this role?')) {
        this.loading.set(true);
        // API expects roleName, but Role interface has name. 
        // Based on API response provided by user: { id: "...", name: "Admin" }
        // And DELETE endpoint: /api/Role/deleteRole/{roleName}
        // So we should use role.name
        this.rolesService.deleteRole(role.name)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role deleted successfully' });
                    this.loadRoles();
                },
                error: (err) => {
                    console.error('Failed to delete role', err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete role' });
                }
            });
    }
  }

  onSave(roleData: Record<string, unknown>) {
    this.saving.set(true);
    
    // API only supports creating roles with roleName
    const createRequest = {
        roleName: String(roleData['roleName'] ?? '')
    };

    this.rolesService.createRole(createRequest)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role saved successfully' });
          this.viewState.set('list');
          this.loadRoles();
        },
        error: (err) => {
          console.error('Save failed', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save role' });
        }
      });
  }

  onPermissionsSave() {
    this.viewState.set('list');
    this.selectedRole.set(null);
  }

  onCancel() {
    this.viewState.set('list');
    this.selectedRole.set(null);
  }
}
