import {
  Component,
  DestroyRef,
  Inject,
  OnInit,
  inject,
} from '@angular/core';
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
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputField } from '../../../../shared/components/input-field/input-field';
import { Button } from '../../../../shared/components/button/button';
import { DriverService } from '../services/driver-management.service';
import { InputFieldConfig } from '../../../../shared/components/input-field/input-field.config';
import { ButtonConfig } from '../../../../shared/components/button/button.config';
import { DriverDialogData } from '../models/driver-management.model';


// function notWhitespaceOnly(): ValidatorFn {
//   return (control: AbstractControl): ValidationErrors | null => {
//     const v: string = control.value ?? '';
//     return v.length > 0 && v.trim().length === 0
//       ? { whitespaceOnly: true }
//       : null;
//   };
// }

interface DriverForm {
  name: FormControl<string>;
  phone: FormControl<string>;
  licenceNo: FormControl<string>;
  isAvailable: FormControl<boolean>;
}

@Component({
  selector: 'app-driver-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDividerModule,
    MatSlideToggleModule,
    InputField,
    Button,
  ],
  templateUrl: './driver-dialog.component.html',
  styleUrl: './driver-dialog.component.scss',
})
export class DriverDialogComponent implements OnInit {
  private readonly driverService = inject(DriverService);
  private readonly dialogRef = inject(MatDialogRef<DriverDialogComponent>);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  form: FormGroup<DriverForm>;
  saving = false;

  nameConfig: InputFieldConfig;
  phoneConfig: InputFieldConfig;
  licenceConfig: InputFieldConfig;

  cancelButtonConfig: ButtonConfig;
  submitButtonConfig: ButtonConfig;
  closeButtonConfig: ButtonConfig;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DriverDialogData) {}

  get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  get title(): string {
    return this.isEdit ? 'Edit Driver' : 'Add Driver';
  }

  get subtitle(): string {
    return this.isEdit
      ? 'Update driver details and save changes.'
      : 'Fill in the details to register a new driver.';
  }

  ngOnInit(): void {
    this.buildForm();
    this.buildConfigs();
  }

  private buildForm(): void {
    this.form = new FormGroup<DriverForm>({
      name: new FormControl(this.data.driver?.name ?? '', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      }),

      phone: new FormControl(this.data.driver?.phone ?? '', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/^\+?[1-9]\d{6,13}$/),
        ],
      }),

      licenceNo: new FormControl(this.data.driver?.licenceNo ?? '', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/^[A-Z]{2}[0-9]{2}\s?[0-9]{4}[0-9]{7}$/),
          Validators.maxLength(50),
        ],
      }),

      isAvailable: new FormControl(this.data.driver?.isAvailable ?? true, {
        nonNullable: true,
      }),
    });
  }

  private buildConfigs(): void {
    this.nameConfig = {
      label: 'Driver Name',
      type: 'text',
      placeholder: 'e.g. Ramesh Kumar',
      minlength: 2,
      maxlength: 100,
      trimStart: true,
      formControlName: 'name',
    };

    this.phoneConfig = {
      label: 'Phone Number',
      type: 'text',
      placeholder: 'e.g. 9876543210',
      maxlength: 14,
      formControlName: 'phone',
    };

    this.licenceConfig = {
      label: 'Licence Number',
      type: 'text',
      placeholder: 'e.g. MH0120240000001',
      maxlength: 50,
      trimStart: true,
      formControlName: 'licenceNo',
    };

    this.cancelButtonConfig = {
      label: 'Cancel',
      variant: 'stroked',
      color: 'default',
      clicked: () => this.cancel(),
    };

    this.submitButtonConfig = {
      label: this.isEdit ? 'Save Changes' : 'Add Driver',
      variant: 'flat',
      color: 'primary',
      loading: this.saving,
      disabled: this.saving,
      clicked: () => this.submit(),
    };

    this.closeButtonConfig = {
      ariaLabel: 'Close',
      prefixIcon: 'close',
      variant: 'stroked',

      clicked: () => {
        this.cancel();
      },
    };
  }

  submit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.submitButtonConfig.loading = true;
    this.submitButtonConfig.disabled = true;

    const value = this.form.getRawValue();

    const request = this.isEdit
      ? this.driverService.updateDriver(this.data.driver!.id, value)
      : this.driverService.createDriver(value);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toastr.success(
          this.isEdit ? 'Driver updated successfully.' : 'Driver added successfully.'
        );
        this.dialogRef.close({ saved: true });
      },
      error: () => {
        this.saving = false;
        this.submitButtonConfig.loading = false;
        this.submitButtonConfig.disabled = false;
      },
    });
  }

  cancel(): void {
    this.dialogRef.close({ saved: false });
  }
}