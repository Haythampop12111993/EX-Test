import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UsersService } from '../../../../../../core/services/users.service';
import { RolesService } from '../../../../../../core/services/roles.service';
import { AreasService } from '../../../../../../core/services/areas.service';
import { CreateUserRequest, UpdateUserRequest } from '../../../../../../core/models/user.model';
import { Role } from '../../../../../../core/models/role.model';
import { MessageService } from 'primeng/api';
import { DynamicFormComponent } from '../../../../../../shared/components/dynamic-form/dynamic-form.component';
import { FieldConfig } from '../../../../../../shared/models/field-config.interface';
import { forkJoin } from 'rxjs';
import { Area } from '../../../../../../core/models/geo.model';

@Component({
  selector: 'app-users-form',
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule,
    DynamicFormComponent
  ],
  templateUrl: './users-form.component.html',
  styleUrl: './users-form.component.scss'
})
export class UsersFormComponent implements OnInit {
  @Input() userId: string | null = null;
  @Output() cancelled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private usersService = inject(UsersService);
  private rolesService = inject(RolesService);
  private areasService = inject(AreasService);
  private messageService = inject(MessageService);

  config: FieldConfig[] = [];
  initialData: Record<string, unknown> = {};
  loading = signal(false);

  ngOnInit() {
    this.loading.set(true);
    this.loadLookups();
  }

  private loadLookups() {
    forkJoin({
      roles: this.rolesService.getRoles(),
      areas: this.areasService.getAreas()
    }).subscribe({
      next: ({ roles, areas }) => {
        this.buildConfig(roles, areas);
        if (this.userId) {
          this.loadUser();
        } else {
          this.loading.set(false);
        }
      },
      error: (err: unknown) => {
        console.error('Error loading user lookups', err);
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load lookups' });
      }
    });
  }

  private buildConfig(roles: Role[], areas: Area[]) {
    this.config = [
      {
        type: 'text',
        name: 'fullName',
        label: 'dashboard.users.form.fullName',
        placeholder: 'Enter full name',
        required: true,
        gridClass: 'col-span-12 md:col-span-6'
      },
      {
        type: 'email',
        name: 'email',
        label: 'dashboard.users.form.email',
        placeholder: 'Enter email address',
        required: true,
        validations: [{ name: 'email', validator: Validators.email, message: 'dashboard.users.validation.email' }],
        gridClass: 'col-span-12 md:col-span-6'
      },
      {
        type: 'text',
        name: 'phoneNumber',
        label: 'dashboard.users.form.phoneNumber',
        placeholder: 'Enter phone number',
        required: true,
        gridClass: 'col-span-12 md:col-span-6'
      },
      {
        type: 'text',
        name: 'nationalId',
        label: 'dashboard.users.form.nationalId',
        placeholder: 'Enter national ID',
        required: true,
        gridClass: 'col-span-12 md:col-span-6'
      },
      {
        type: 'select',
        name: 'assignedAreaId',
        label: 'dashboard.users.form.assignedAreaId',
        placeholder: 'Select area',
        options: areas
          .slice()
          .sort((a, b) => `${a.regionName ?? ''}${a.name}`.localeCompare(`${b.regionName ?? ''}${b.name}`))
          .map((a) => ({
            label: a.regionName ? `${a.regionName} - ${a.name}` : a.name,
            value: typeof a.id === 'string' ? Number(a.id) : (a.id as number)
          })),
        required: true,
        gridClass: 'col-span-12 md:col-span-6'
      },
      {
        type: 'multiselect',
        name: 'roles',
        label: 'dashboard.users.form.roles',
        placeholder: 'Select roles',
        options: roles.map(r => ({ label: r.name, value: r.name })),
        required: true,
        gridClass: 'col-span-12'
      }
    ];

    if (!this.userId) {
      this.config.splice(4, 0, {
        type: 'password',
        name: 'password',
        label: 'dashboard.users.form.password',
        placeholder: 'Enter password',
        required: true,
        gridClass: 'col-span-12 md:col-span-6'
      });
    }
  }

  private loadUser() {
    this.usersService.getUserById(this.userId!).subscribe({
      next: (user) => {
        this.initialData = { ...user };
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Error loading user', err);
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load user' });
      }
    });
  }

  onSubmit(formData: Record<string, unknown>) {
    this.loading.set(true);
    const data = formData as {
      fullName?: string;
      email?: string;
      phoneNumber?: string;
      nationalId?: string;
      password?: string;
      assignedAreaId?: number;
      roles?: string[];
    };

    if (this.userId) {
      const request: UpdateUserRequest = {
        id: this.userId,
        fullName: data.fullName ?? '',
        email: data.email ?? '',
        phoneNumber: data.phoneNumber ?? '',
        nationalId: data.nationalId ?? '',
        assignedAreaId: data.assignedAreaId ?? 0,
        roles: data.roles ?? []
      };

      this.usersService.updateUser(request).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully' });
          this.saved.emit();
          this.loading.set(false);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user' });
          this.loading.set(false);
        }
      });
    } else {
      const request: CreateUserRequest = {
        fullName: data.fullName ?? '',
        email: data.email ?? '',
        phoneNumber: data.phoneNumber ?? '',
        nationalId: data.nationalId ?? '',
        password: data.password ?? '',
        assignedAreaId: data.assignedAreaId ?? 0,
        roles: data.roles ?? []
      };

      this.usersService.createUser(request).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User created successfully' });
          this.saved.emit();
          this.loading.set(false);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create user' });
          this.loading.set(false);
        }
      });
    }
  }
}
