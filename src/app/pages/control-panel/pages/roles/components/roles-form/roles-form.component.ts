import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from '../../../../../../shared/components/dynamic-form/dynamic-form.component';
import { FieldConfig } from '../../../../../../shared/models/field-config.interface';
import { Role } from '../../../../../../core/models/role.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-roles-form',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent, TranslateModule],
  templateUrl: './roles-form.component.html',
  styleUrl: './roles-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesFormComponent implements OnChanges {
  @Input() role: Role | null = null;
  @Input() loading: boolean = false;
  
  @Output() save = new EventEmitter<Omit<Role, 'id'> | Partial<Role>>();
  @Output() cancel = new EventEmitter<void>();

  isEdit = false;
  initialData: any = {};

  config: FieldConfig[] = [
    {
      type: 'text',
      name: 'roleName',
      label: 'dashboard.table.headers.roleName',
      placeholder: 'Enter role name',
      required: true
    }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['role']) {
      this.isEdit = !!this.role;
      this.initialData = this.role ? { ...this.role } : {};
    }
  }

  onSubmit(formData: any) {
    // Transform data if necessary
    // Permissions in Role is string[], but select might return string.
    // Ensure compatibility.
    const roleData = { ...formData };
    if (typeof roleData.permissions === 'string') {
        roleData.permissions = [roleData.permissions];
    }
    this.save.emit(roleData);
  }
}
