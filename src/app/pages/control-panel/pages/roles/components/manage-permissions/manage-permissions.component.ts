import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { PermissionsService } from '../../../../../../core/services/permissions.service';
import { RoleClaim, UpdatePermissionsRequest } from '../../../../../../core/models/permissions.model';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';

interface PermissionGroup {
  name: string;
  claims: RoleClaim[];
}

@Component({
  selector: 'app-manage-permissions',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonModule, ToggleSwitchModule, TableModule, FormsModule],
  templateUrl: './manage-permissions.component.html',
  styleUrls: ['./manage-permissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagePermissionsComponent implements OnInit {
  @Input() roleId!: string;
  @Input() roleNameLabel: string = '';
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  private permissionsService = inject(PermissionsService);
  private messageService = inject(MessageService);

  claims = signal<RoleClaim[]>([]);
  roleName = signal<string>('');
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  
  allSelected = signal<boolean>(false);

  // Group permissions by category (e.g., Permissions.Scouting.Create -> Scouting)
  groupedClaims = computed(() => {
    const currentClaims = this.claims();
    const groups = new Map<string, RoleClaim[]>();

    currentClaims.forEach(claim => {
      // Assuming format: Permissions.Category.Action or just Category.Action
      // If value is "Permissions.Scouting.Create", parts are ["Permissions", "Scouting", "Create"]
      const parts = claim.value.split('.');
      let category = 'Other';
      
      if (parts.length >= 2) {
        // If starts with Permissions, take index 1, else index 0
        if (parts[0] === 'Permissions' && parts.length >= 3) {
            category = parts[1];
        } else {
            category = parts[0];
        }
      }

      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)?.push(claim);
    });

    const result: PermissionGroup[] = [];
    groups.forEach((claims, name) => {
      result.push({ name, claims });
    });
    
    // Sort groups alphabetically or by predefined order
    return result.sort((a, b) => a.name.localeCompare(b.name));
  });

  ngOnInit() {
    if (this.roleNameLabel) {
        this.roleName.set(this.roleNameLabel);
    }
    if (this.roleId) {
      this.loadPermissions();
    }
  }

  loadPermissions() {
    this.loading.set(true);
    this.permissionsService.getRolePermissions(this.roleId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          if (data && Array.isArray((data as any).roleClaims)) {
             this.claims.set((data as any).roleClaims);
             this.roleName.set(data.roleName || '');
          } else if (Array.isArray(data)) {
             this.claims.set(data);
          } else {
             this.claims.set((data as any).permissions || (data as any).claims || []);
             this.roleName.set(data.roleName || '');
          }
          this.updateAllSelectedState();
        },
        error: (err) => {
          console.error('Failed to load permissions', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load permissions' });
        }
      });
  }

  toggleAll(checked: boolean) {
    this.claims.update(claims => claims.map(c => ({ ...c, isSelected: checked })));
    this.allSelected.set(checked);
  }

  toggleGroup(groupName: string, checked: boolean) {
    this.claims.update(claims => {
      return claims.map(c => {
        if (c.value.includes(groupName)) {
           return { ...c, isSelected: checked };
        }
        return c;
      });
    });
    this.updateAllSelectedState();
  }

  updateAllSelectedState() {
    const claims = this.claims();
    this.allSelected.set(claims.length > 0 && claims.every(c => c.isSelected));
  }

  onSave() {
    this.saving.set(true);
    const request: UpdatePermissionsRequest = {
      roleId: this.roleId,
      roleClaims: this.claims()
    };

    this.permissionsService.updatePermissions(request)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Permissions updated successfully' });
          this.save.emit();
        },
        error: (err) => {
          console.error('Failed to update permissions', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update permissions' });
        }
      });
  }
}
