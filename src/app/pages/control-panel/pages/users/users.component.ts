import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UsersListComponent, UsersFormComponent } from './components';
import { UsersService } from '../../../../core/services/users.service';
import { User } from '../../../../core/models/user.model';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule, 
    UsersListComponent, 
    UsersFormComponent,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  viewState = signal<'list' | 'form'>('list');
  selectedUserId = signal<string | null>(null);
  users = signal<User[]>([]);
  loading = signal<boolean>(false);

  private usersService = inject(UsersService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    // For now loading all users without pagination params as per initial requirement
    // In future we can add pagination state
    this.usersService.getAllUsers()
      .pipe(finalize(() => {
        this.loading.set(false);
        this.cdr.markForCheck(); // Ensure change detection runs
      }))
      .subscribe({
        next: (response) => {
          this.users.set(response.data);
        },
        error: (err) => {
          console.error('Error loading users', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
        }
      });
  }

  showList() {
    this.viewState.set('list');
    this.selectedUserId.set(null);
  }

  showForm(user?: User) {
    this.selectedUserId.set(user ? user.id : null);
    this.viewState.set('form');
  }

  onDelete(user: User) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this user?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.usersService.deleteUser(user.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User deleted successfully' });
            this.loadUsers();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user' });
          }
        });
      }
    });
  }

  onFormSave() {
    this.loadUsers();
    this.showList();
  }
}
