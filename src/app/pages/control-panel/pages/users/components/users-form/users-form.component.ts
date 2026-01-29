import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UsersService } from '../../../../../../core/services/users.service';
import { RolesService } from '../../../../../../core/services/roles.service';
import { CreateUserRequest, UpdateUserRequest } from '../../../../../../core/models/user.model';
import { Role } from '../../../../../../core/models/role.model';
import { MessageService } from 'primeng/api';
import { DynamicFormComponent } from '../../../../../../shared/components/dynamic-form/dynamic-form.component';
import { FieldConfig } from '../../../../../../shared/models/field-config.interface';

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
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  private usersService = inject(UsersService);
  private rolesService = inject(RolesService);
  private messageService = inject(MessageService);

  config: FieldConfig[] = [];
  initialData: any = {};
  loading = signal(false);

  ngOnInit() {
    this.loading.set(true);
    this.loadRoles();
  }

  private loadRoles() {
    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.buildConfig(roles);
        if (this.userId) {
          this.loadUser();
        } else {
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Error loading roles', err);
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load roles' });
      }
    });
  }

  private buildConfig(roles: Role[]) {
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
        type: 'number',
        name: 'assignedAreaId',
        label: 'dashboard.users.form.assignedAreaId',
        placeholder: 'Enter assigned area ID',
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
      error: (err) => {
        console.error('Error loading user', err);
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load user' });
      }
    });
  }

  onSubmit(formData: any) {
    this.loading.set(true);

    if (this.userId) {
      const request: UpdateUserRequest = {
        id: this.userId,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        assignedAreaId: formData.assignedAreaId,
        roles: formData.roles
      };

      this.usersService.updateUser(request).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully' });
          this.save.emit();
          this.loading.set(false);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user' });
          this.loading.set(false);
        }
      });
    } else {
      const request: CreateUserRequest = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        nationalId: formData.nationalId,
        password: formData.password,
        assignedAreaId: formData.assignedAreaId,
        roles: formData.roles
      };

      this.usersService.createUser(request).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User created successfully' });
          this.save.emit();
          this.loading.set(false);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create user' });
          this.loading.set(false);
        }
      });
    }
  }
}
