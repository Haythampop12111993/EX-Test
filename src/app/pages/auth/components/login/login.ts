import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { TranslateModule } from '@ngx-translate/core';
import { AuthLayoutComponent } from '../../../../layouts/auth-layout/auth-layout';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RippleModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    PasswordModule,
    TranslateModule,
    AuthLayoutComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [true],
  });

  submitting = false;

  submit() {
    if (this.form.invalid) return;
    this.submitting = true;
    // Placeholder: simulate success and navigate; replace with AuthService
    setTimeout(() => {
      localStorage.setItem('ACCESS_TOKEN', 'dummy');
      this.submitting = false;
      this.router.navigateByUrl('/dashboard');
    }, 600);
  }
}
