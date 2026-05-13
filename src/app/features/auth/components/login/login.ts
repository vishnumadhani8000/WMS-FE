import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Button } from '../../../../shared/components/button/button';
import { InputField } from '../../../../shared/components/input-field/input-field';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { APP_ROUTES } from '../../../../shared/constants/app-routes.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputField,
    Button,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private toast = inject(ToastrService);

  isSubmitting = false;

  loginForm: FormGroup = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(50),
        Validators.pattern(/^\S+@\S+\.\S+$/),
      ],
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(25),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
      ],
    ],
  });

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload = {
      ...this.loginForm.value,
      email: this.loginForm.value.email.trim().toLowerCase(),
    };

    this.authService.login(payload).subscribe({
      next: (res) => {
        if (!res.isSuccess || !res.data) {
          this.toast.error('Login failed');
          return;
        }

        this.toast.success('Login successful!');

        const role = this.authService.getUserRole();

        this.router.navigate([
          role === 'Admin'
            ? `/${APP_ROUTES.ADMIN.ROOT}/${APP_ROUTES.ADMIN.PRODUCT_MANAGEMENT}`
            : `/${APP_ROUTES.CUSTOMER.ROOT}/${APP_ROUTES.CUSTOMER.HOME}`,
        ]);
      },

      error: (err) => {
        const message = err?.error?.message || 'Invalid email or password';

        this.toast.error(message);

        this.isSubmitting = false;
      },

      complete: () => (this.isSubmitting = false),
    });
  }
  trimEmail(): void {
    const control = this.loginForm.get('email');
  
    if (control?.value) {
      control.setValue(control.value.trim().toLowerCase());
    }
  }
}
