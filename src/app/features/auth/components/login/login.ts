import { CommonModule } from '@angular/common';

import { Component, inject, OnInit } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ToastrService } from 'ngx-toastr';

import { Button } from '../../../../shared/components/button/button';

import { ButtonConfig } from '../../../../shared/components/button/button.config';

import { InputField } from '../../../../shared/components/input-field/input-field';

import { InputFieldConfig } from '../../../../shared/components/input-field/input-field.config';

import { AuthService } from '../../services/auth.service';

import { APP_ROUTES } from '../../../../shared/constants/app-routes.constants';

interface LoginForm {
  email: FormControl<string>;

  password: FormControl<string>;
}

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
export class Login implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastrService);

  form!: FormGroup<LoginForm>;
  isSubmitting = false;
  emailConfig!: InputFieldConfig;
  passwordConfig!: InputFieldConfig;
  loginButtonConfig!: ButtonConfig;

  ngOnInit(): void {
    this.form = new FormGroup<LoginForm>({
      email: new FormControl('', {
        nonNullable: true,

        validators: [
          Validators.required,

          Validators.email,

          Validators.maxLength(50),

          Validators.pattern(/^\S+@\S+\.\S+$/),
        ],
      }),

      password: new FormControl('', {
        nonNullable: true,

        validators: [
          Validators.required,

          Validators.minLength(8),

          Validators.maxLength(25),

          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
        ],
      }),
    });

    // =========================
    // Email Config
    // =========================

    this.emailConfig = {
      label: 'Email',

      type: 'email',

      placeholder: 'Enter your email',

      prefixIcon: 'email',

      maxlength: 50,

      subscriptSizing: 'dynamic',

      trimStart: true,

      control: this.form.controls.email,
    };

    // =========================
    // Password Config
    // =========================

    this.passwordConfig = {
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
      prefixIcon: 'lock',
      maxlength: 50,
      subscriptSizing: 'dynamic',
      trimStart: true,
      control: this.form.controls.password,
    };



    this.loginButtonConfig = {
      label: 'Login',
      variant: 'raised',
      color: 'primary',
      fullWidth: true,

      clicked: () => {
        this.submit();
      },
    };
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.isSubmitting = true;

    this.loginButtonConfig.loading = true;

    const payload = {
      ...this.form.getRawValue(),

      email: this.form.controls.email.value.trim().toLowerCase(),
    };

    this.authService.login(payload).subscribe({
      next: (res) => {
        if (!res.isSuccess || !res.data) {
          this.toast.error('Login failed');

          this.isSubmitting = false;

          this.loginButtonConfig.loading = false;

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

        this.loginButtonConfig.loading = false;
      },

      complete: () => {
        this.isSubmitting = false;

        this.loginButtonConfig.loading = false;
      },
    });
  }

  trimEmail(): void {
    const control = this.form.controls.email;

    if (control.value) {
      control.setValue(control.value.trim().toLowerCase());
    }
  }
}
