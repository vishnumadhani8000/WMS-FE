import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InputField } from '../input-field/input-field';
import { Button } from '../button/button';

import { ProfileForm, UserProfile } from './Models/profile.model';
import { InputFieldConfig } from '../input-field/input-field.config';
import { ButtonConfig } from '../button/button.config';

import { EditProfileDialogComponent } from './edit-profile-dialog.component/edit-profile-dialog.component';
import { ChangePasswordDialogComponent } from './change-password-dialog.component/change-password-dialog.component';
import { ProfileService } from './Services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputField, Button],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private dialog = inject(MatDialog);
  private profileService = inject(ProfileService);
  private destroyRef = inject(DestroyRef);

  profile: UserProfile | null = null;
  form: FormGroup<ProfileForm>;

  nameConfig: InputFieldConfig;
  emailConfig: InputFieldConfig;
  phoneConfig: InputFieldConfig;
  roleConfig: InputFieldConfig;

  editButtonConfig: ButtonConfig;
  passwordButtonConfig: ButtonConfig;

  ngOnInit(): void {
    this.initializeForm();
    this.loadProfile();
  }

  openEditProfile(): void {

    if (!this.profile) {
      return;
    }

    const dialogRef = this.dialog.open(EditProfileDialogComponent, {
      width: '520px',
      data: {
        profile : this.profile,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.saved) {
        this.loadProfile();
      }
    });
  }

  openChangePassword(): void {
    this.dialog.open(ChangePasswordDialogComponent, {
      width: '520px',
    });
  }

  private loadProfile(): void {
    this.profileService
      .getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.profile= profile;

          this.form.patchValue({
            name: profile.name,
            email: profile.email,
            phone: profile.phone ?? '',
            role: profile.role,
          });
        },
      });
  }

  private initializeForm(): void {
    this.form = new FormGroup<ProfileForm>({
      name: new FormControl('', {
nonNullable: true,}),

      email: new FormControl('', {
        nonNullable: true,  
      }),

      phone: new FormControl('', {
        nonNullable: true,
      }),

      role: new FormControl('', {
        nonNullable: true,
      }),
    });

    this.nameConfig = {
      label: 'Full Name',
      formControlName: 'name',
      readonly: true,
    };

    this.emailConfig = {
      label: 'Email Address',
      formControlName: 'email',
      readonly: true,
    };

    this.phoneConfig = {
      label: 'Mobile Number',
      formControlName: 'phone',
      readonly: true,
    };

    this.roleConfig = {
      label: 'Role',
      formControlName: 'role',
      readonly: true,
    };

    this.editButtonConfig = {
      label: 'Edit Profile',
      variant: 'flat',
      color: 'primary',
      clicked: () => {
        this.openEditProfile();
      },
    };



    this.passwordButtonConfig = {
      label: 'Change Password',
      variant: 'stroked',
      color: 'default',
      clicked: () => {
        this.openChangePassword();
      },
    };
  }
}