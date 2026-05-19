import { Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
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

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { VehicleService } from '../../services/vehicle.service';
import { VehicleDialogData } from '../../models/vehicle.model';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Button } from '../../../../../shared/components/button/button';
import { InputFieldConfig } from '../../../../../shared/components/input-field/input-field.config';
import { ToastrService } from 'ngx-toastr';
import { ButtonConfig } from '../../../../../shared/components/button/button.config';

// Validator
export function plateNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value as string;

    if (!raw?.trim()) {
      return null;
    }

    const normalized = raw.trim().replace(/[\s-]/g, '').toUpperCase();

    const isValid = /^([A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}|[0-9]{2}BH[0-9]{4}[A-Z]{2})$/.test(
      normalized
    );

    return isValid
      ? null
      : {
          plateFormat: {
            message: 'Invalid Indian vehicle plate number format.',
          },
        };
  };
}

// Typed Form
interface VehicleForm {
  name: FormControl<string>;
  plateNumber: FormControl<string>;
  capacityKg: FormControl<number | null>;
  isAvailable: FormControl<boolean>;
}

@Component({
  selector: 'app-vehicle-dialog',
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

  templateUrl: './vehicle-dialog-component.html',
  styleUrl: './vehicle-dialog-component.scss',
})
export class VehicleDialogComponent implements OnInit, OnDestroy {
  private vehicleService = inject(VehicleService);
  private dialogRef = inject(MatDialogRef<VehicleDialogComponent>);
  private toastr = inject(ToastrService);
  private destroy = new Subject<void>();
  form: FormGroup<VehicleForm>;
  saving = false;

  // Configs
  vehicleNameConfig: InputFieldConfig;
  plateNumberConfig: InputFieldConfig;
  capacityConfig: InputFieldConfig;
  cancelButtonConfig: ButtonConfig;
  submitButtonConfig: ButtonConfig;
  closeButtonConfig: ButtonConfig;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: VehicleDialogData
  ) {}

  get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  get title(): string {
    return this.isEdit ? 'Edit Vehicle' : 'Add Vehicle';
  }

  ngOnInit(): void {
    const vehicle = this.data.vehicle;

    // Form
    this.form = new FormGroup<VehicleForm>({
      name: new FormControl(vehicle?.name ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      }),

      plateNumber: new FormControl(vehicle?.plateNumber ?? '', {
        nonNullable: true,
        validators: [Validators.required, plateNumberValidator()],
      }),

      capacityKg: new FormControl(vehicle?.capacityKg ?? null, {
        validators: [Validators.required, Validators.min(0.01), Validators.max(100000)],
      }),

      isAvailable: new FormControl(vehicle?.isAvailable ?? true, {
        nonNullable: true,
      }),
    });

    // Vehicle Name Config
    this.vehicleNameConfig = {
      label: 'Vehicle Name',
      type: 'text',
      placeholder: 'e.g. Tata Ace',
      minlength: 2,
      maxlength: 100,
      trimStart: true,
      control: this.form.controls.name,
    };

    // Plate Number Config
    this.plateNumberConfig = {
      label: 'Plate Number',
      type: 'text',
      placeholder: 'e.g. MH12AB1234',
      subscriptSizing: 'dynamic',
      trimStart: true,
      control: this.form.controls.plateNumber,
    };

    // Capacity Config
    this.capacityConfig = {
      label: 'Capacity (kg)',
      type: 'number',
      placeholder: 'e.g. 1000',
      min: 0.01,
      max: 100000,
      step: 0.01,
      subscriptSizing: 'dynamic',
      control: this.form.controls.capacityKg,
    };
    this.cancelButtonConfig = {
      label: 'Cancel',
      variant: 'stroked',
      color: 'default',

      clicked: () => {
        this.cancel();
      },
    };

    this.submitButtonConfig = {
      label: this.isEdit ? 'Save Changes' : 'Add Vehicle',

      variant: 'flat',
      color: 'primary',
      loading: this.saving,
      disabled: this.saving,

      clicked: () => {
        this.submit();
      },
    };
    this.closeButtonConfig = {
      prefixIcon: 'close',
      variant: 'stroked',

      clicked: () => {
        this.cancel();
      },
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  submit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const value = this.form.getRawValue();
    const request = this.isEdit
      ? this.vehicleService.updateVehicle(this.data.vehicle!.id, value)
      : this.vehicleService.createVehicle(value);

    request.pipe(takeUntil(this.destroy)).subscribe({
      next: () => {
        this.saving = false;
        this.toastr.success(
          this.isEdit ? 'Vehicle updated successfully.' : 'Vehicle added successfully.'
        );
        this.dialogRef.close({
          saved: true,
        });
      },

      error: (err) => {
        this.saving = false;
        this.toastr.error(this.isEdit ? 'Failed to update vehicle.' : 'Failed to add vehicle.');
      },
    });
  }

  cancel(): void {
    this.dialogRef.close({
      saved: false,
    });
  }
}
