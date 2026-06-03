import { Component, DestroyRef, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { MatDividerModule } from '@angular/material/divider';

import { ToastrService } from 'ngx-toastr';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputField } from '../../input-field/input-field';
import { Button } from '../../button/button';
import { ButtonConfig } from '../../button/button.config';
import { InputFieldConfig } from '../../input-field/input-field.config';
import { EditProfileDialogData } from '../Models/profile.model';
import { ProfileService } from '../Services/profile.service';

interface EditProfileForm {
  name: FormControl<string>;
  phone: FormControl<string>;
}

@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDividerModule,
    InputField,
    Button,
  ],
  templateUrl: './edit-profile-dialog.component.html',
  styleUrl: './edit-profile-dialog.component.scss',
})
export class EditProfileDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<EditProfileDialogComponent>);
  private toastr = inject(ToastrService);
  private destroyRef = inject(DestroyRef);

  form: FormGroup<EditProfileForm>;

  saving = false;

  nameConfig: InputFieldConfig;
  phoneConfig: InputFieldConfig;

  cancelButtonConfig: ButtonConfig;
  submitButtonConfig: ButtonConfig;
  closeButtonConfig: ButtonConfig;
  private profileService = inject(ProfileService);
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: EditProfileDialogData
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup<EditProfileForm>({
      name: new FormControl(this.data.profile.name, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.maxLength(120),
        ],
      }),
    
      phone: new FormControl(this.data.profile.phone ?? '', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.maxLength(14),
          Validators.pattern(/^\+?[1-9]\d{6,13}$/),
        ],
      }),
    });

    this.nameConfig = {
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter full name',
      minlength: 2,
      maxlength: 100,
      trimStart: true,
      formControlName: 'name',
    };

    this.phoneConfig = {
      label: 'Mobile Number',
      type: 'text',
      placeholder: '9876543210',
      maxlength: 10,
      formControlName: 'phone',
    };

    this.cancelButtonConfig = {
      label: 'Cancel',
      variant: 'stroked',
      color: 'default',
      clicked: () => this.cancel(),
    };

    this.submitButtonConfig = {
      label: 'Save Changes',
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
      .updateProfile({
        name: value.name,
        phone: value.phone,
      })
      .subscribe({
        next: () => {
          this.saving = false;

          this.toastr.success('Profile updated successfully.');

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
