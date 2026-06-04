import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { Button } from '../../../../shared/components/button/button';
import { ButtonConfig } from '../../../../shared/components/button/button.config';
import { InputField } from '../../../../shared/components/input-field/input-field';
import { InputFieldConfig } from '../../../../shared/components/input-field/input-field.config';
import { AuthService } from '../../services/auth.service';
import { APP_ROUTES } from '../../../../shared/constants/app-routes.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoginForm, SignUpForm } from '../../models/lodin-signup.model';


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

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly toast: ToastrService,
    private readonly destroyref: DestroyRef,

  ) {}


  activeTab: 'login' | 'signup' = 'login';
  form: FormGroup<LoginForm>;
  emailConfig: InputFieldConfig;
  passwordConfig: InputFieldConfig;
  loginButtonConfig: ButtonConfig;
  signUpForm: FormGroup<SignUpForm>;
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

  setTab(tab: 'login' | 'signup'): void {
    this.activeTab = tab;
  }

  
  // ─── Login submit ───────────────────────────
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = {
      ...this.form.getRawValue(),
      email: this.form.controls.email.value.trim().toLowerCase(),
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
            : `/${APP_ROUTES.CUSTOMER.ROOT}/${APP_ROUTES.CUSTOMER.PRODUCT}`,
          ]);
      },
    });
  }
  
  // ─── Sign Up submit ───────────────────────────────────────────
  submitSignUp(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    
    const { confirmPassword, ...rest } = this.signUpForm.getRawValue();
    const payload = {
      ...rest,
      email: this.signUpForm.controls.email.value.trim().toLowerCase(),
      name: this.signUpForm.controls.name.value.trim(),
    };

    this.authService.signUp(payload).subscribe({
      next: (res) => {
        if (!res.isSuccess) {
          this.toast.error('Registration failed');
          return;
        }

        this.toast.success('Account created! Please login.');
        this.activeTab = 'login';
        this.signUpForm.reset();
      },
    });
  }
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
      autocomplete: 'username',
    };

    this.passwordConfig = {
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
      prefixIcon: 'lock',
      maxlength: 50,
      trimStart: true,
      formControlName: 'password',
      autocomplete: 'current-password'
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
      .pipe(takeUntilDestroyed(this.destroyref))
      .subscribe(status => {
        this.loginButtonConfig.disabled = status !== 'VALID';
      });
  }

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
      autocomplete: 'username',
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
      autocomplete: 'new-password',
      formControlName: 'password',
    };

    this.confirmPasswordConfig = {
      label: 'Confirm Password',
      type: 'password',
      placeholder: 'Re-enter your password',
      prefixIcon: 'lock',
      maxlength: 50,
      trimStart: true,
      autocomplete: 'new-password',
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

  }



  private passwordMatchValidator(
    group: AbstractControl
  ): ValidationErrors | null {

    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({
        passwordMismatch: {
          message: 'Passwords do not match',
        },
      });

      return null;
    }

    confirmPassword.setErrors(null);
    return null;
  }
}