import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { MatDividerModule } from '@angular/material/divider';

import { ToastrService } from 'ngx-toastr';
import { InputField } from '../../input-field/input-field';
import { Button } from '../../button/button';
import { InputFieldConfig } from '../../input-field/input-field.config';
import { ButtonConfig } from '../../button/button.config';
import { ProfileService } from '../Services/profile.service';

function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;

    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword
      ? null
      : {
          passwordMismatch: true,
        };
  };
}

interface ChangePasswordForm {
  currentPassword: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDividerModule,
    InputField,
    Button,
  ],
  templateUrl: './change-password-dialog.component.html',
  styleUrl: './change-password-dialog.component.scss',
})
export class ChangePasswordDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<ChangePasswordDialogComponent>);
  private toastr = inject(ToastrService);
  private destroyRef = inject(DestroyRef);
  private profileService = inject(ProfileService);

  form: FormGroup<ChangePasswordForm>;

  saving = false;

  currentPasswordConfig: InputFieldConfig;
  newPasswordConfig: InputFieldConfig;
  confirmPasswordConfig: InputFieldConfig;

  cancelButtonConfig: ButtonConfig;
  submitButtonConfig: ButtonConfig;
  closeButtonConfig: ButtonConfig;

  ngOnInit(): void {
    this.form = new FormGroup<ChangePasswordForm>(
      {
        currentPassword: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required],
        }),

        newPassword: new FormControl('', {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(50),
            Validators.pattern(
              /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/
            ),
          ],
        }),

        confirmPassword: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
      },
      {
        validators: passwordMatchValidator(),
      }
    );

    this.currentPasswordConfig = {
      label: 'Current Password',
      type: 'password',
      placeholder: 'Enter current password',
      formControlName: 'currentPassword',
    };

    this.newPasswordConfig = {
      label: 'New Password',
      type: 'password',
      placeholder: 'Enter new password',
      minlength: 8,
      maxlength: 50,
      formControlName: 'newPassword',
    };
    this.confirmPasswordConfig = {
      label: 'Confirm Password',
      type: 'password',
      placeholder: 'Re-enter new password',
      minlength: 8,
      maxlength: 50,
      formControlName: 'confirmPassword',
    };

    this.cancelButtonConfig = {
      label: 'Cancel',
      variant: 'stroked',
      color: 'default',
      clicked: () => this.cancel(),
    };

    this.submitButtonConfig = {
      label: 'Change Password',
      variant: 'flat',
      color: 'primary',
      loading: this.saving,
      disabled: this.saving,
      clicked: () => this.submit(),
    };

    this.closeButtonConfig = {
      prefixIcon: 'close',
      variant: 'stroked',
      clicked: () => this.cancel(),
    };
  }

  submit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    const value = this.form.getRawValue();

    this.profileService
      .changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        confirmPassword: value.confirmPassword,
      })
      .subscribe({
        next: () => {
          this.saving = false;

          this.toastr.success('Password changed successfully.');

          this.dialogRef.close({
            saved: true,
          });
        },
        error: () => {
          this.saving = false;
        },
      });
  }
  cancel(): void {
    this.dialogRef.close({
      saved: false,
    });
  }
}
