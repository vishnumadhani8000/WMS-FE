import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
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

interface SignUpForm {
  name: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
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
export class Login implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastrService);
  private readonly destroy$ = new Subject<void>();

  // ─── Tab state ───────────────────────────────────────────────
  activeTab: 'login' | 'signup' = 'login';

  // ─── Login ───────────────────────────────────────────────────
  form: FormGroup<LoginForm>;
  isSubmitting = false;
  emailConfig: InputFieldConfig;
  passwordConfig: InputFieldConfig;
  loginButtonConfig: ButtonConfig;

  // ─── Sign Up ──────────────────────────────────────────────────
  signUpForm: FormGroup<SignUpForm>;
  isSignUpSubmitting = false;
  nameConfig: InputFieldConfig;
  signUpEmailConfig: InputFieldConfig;
  phoneConfig: InputFieldConfig;
  signUpPasswordConfig: InputFieldConfig;
  confirmPasswordConfig: InputFieldConfig;
  signUpButtonConfig: ButtonConfig;

  ngOnInit(): void {
    this.initLoginForm();
    this.initSignUpForm();
  }

  // ─── Tab toggle ───────────────────────────────────────────────
  setTab(tab: 'login' | 'signup'): void {
    this.activeTab = tab;
  }

  // ─── Login form setup ─────────────────────────────────────────
  private initLoginForm(): void {
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
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
          ),
        ],
      }),
    });

    this.emailConfig = {
      label: 'Email',
      type: 'email',
      placeholder: 'Enter your email',
      prefixIcon: 'email',
      maxlength: 50,
      trimStart: true,
      formControlName: 'email',
    };

    this.passwordConfig = {
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
      prefixIcon: 'lock',
      maxlength: 50,
      trimStart: true,
      formControlName: 'password',
    };

    this.loginButtonConfig = {
      label: 'Login',
      variant: 'raised',
      color: 'primary',
      fullWidth: true,
      disabled: true,
      clicked: () => this.submit(),
    };

    this.form.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.loginButtonConfig.disabled = status !== 'VALID';
      });
  }

  // ─── Sign Up form setup ───────────────────────────────────────
  private initSignUpForm(): void {
    this.signUpForm = new FormGroup<SignUpForm>({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(120)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.email,
          Validators.maxLength(50),
          Validators.pattern(/^\S+@\S+\.\S+$/),
        ],
      }),
      phone: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.maxLength(14),
          Validators.pattern(/^\+?[1-9]\d{6,13}$/),
        ],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(50),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])[A-Za-z\d\S]+$/
          ),
        ],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    }, { validators: this.passwordMatchValidator });

    this.nameConfig = {
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter your full name',
      prefixIcon: 'person',
      maxlength: 120,
      trimStart: true,
      formControlName: 'name',
    };

    this.signUpEmailConfig = {
      label: 'Email',
      type: 'email',
      placeholder: 'Enter your email',
      prefixIcon: 'email',
      maxlength: 50,
      trimStart: true,
      formControlName: 'email',
    };

    this.phoneConfig = {
      label: 'Phone Number',
      type: 'number',
      placeholder: '+91XXXXXXXXXX',
      prefixIcon: 'phone',
      maxlength: 14,
      trimStart: true,
      formControlName: 'phone',
    };

    this.signUpPasswordConfig = {
      label: 'Password',
      type: 'password',
      placeholder: 'Create a strong password',
      prefixIcon: 'lock',
      maxlength: 50,
      trimStart: true,
      formControlName: 'password',
    };

    this.confirmPasswordConfig = {
      label: 'Confirm Password',
      type: 'password',
      placeholder: 'Re-enter your password',
      prefixIcon: 'lock',
      maxlength: 50,
      trimStart: true,
      formControlName: 'confirmPassword',
    };

    this.signUpButtonConfig = {
      label: 'Create Account',
      variant: 'raised',
      color: 'primary',
      fullWidth: true,
      disabled: true,
      clicked: () => this.submitSignUp(),
    };

    this.signUpForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.signUpButtonConfig.disabled = status !== 'VALID';
      });
  }

  // ─── Cleanup ──────────────────────────────────────────────────
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Cross-field validator ────────────────────────────────────
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pw = group.get('password')?.value;
    const cpw = group.get('confirmPassword')?.value;
    if (cpw && pw !== cpw) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    // Clear the error if passwords match (but keep other existing errors)
    const confirmCtrl = group.get('confirmPassword');
    if (confirmCtrl?.hasError('passwordMismatch')) {
      const { passwordMismatch, ...rest } = confirmCtrl.errors!;
      confirmCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
  }

  // ─── Login submit ─────────────────────────────────────────────
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
        this.isSubmitting = false;
        this.loginButtonConfig.loading = false;

        if (!res.isSuccess || !res.data) {
          this.toast.error('Login failed');
          return;
        }

        this.toast.success('Login successful!');

        const role = this.authService.getUserRole();
        this.router.navigate([
          role === 'Admin'
            ? `/${APP_ROUTES.ADMIN.ROOT}/${APP_ROUTES.ADMIN.PRODUCT_MANAGEMENT}`
            : `/${APP_ROUTES.CUSTOMER.ROOT}/${APP_ROUTES.CUSTOMER.PRODUCT}`,
        ]);
      },
      error: () => {
        this.isSubmitting = false;
        this.loginButtonConfig.loading = false;
        this.toast.error('Something went wrong. Please try again.');
      },
    });
  }

  // ─── Sign Up submit ───────────────────────────────────────────
  submitSignUp(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    this.isSignUpSubmitting = true;
    this.signUpButtonConfig.loading = true;

    const { confirmPassword, ...rest } = this.signUpForm.getRawValue();
    const payload = {
      ...rest,
      email: this.signUpForm.controls.email.value.trim().toLowerCase(),
      name: this.signUpForm.controls.name.value.trim(),
    };

    this.authService.signUp(payload).subscribe({
      next: (res) => {
        this.isSignUpSubmitting = false;
        this.signUpButtonConfig.loading = false;

        if (!res.isSuccess) {
          this.toast.error('Registration failed');
          return;
        }

        this.toast.success('Account created! Please login.');
        this.activeTab = 'login';
        this.signUpForm.reset();
      },
      error: () => {
        this.isSignUpSubmitting = false;
        this.signUpButtonConfig.loading = false;
        this.toast.error('Something went wrong. Please try again.');
      },
    });
  }
}