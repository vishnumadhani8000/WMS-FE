// vehicle-dialog-component.ts

import { Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  AbstractControl,
  FormBuilder,
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
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { VehicleService } from '../../services/vehicle.service';
import { VehicleDialogData } from '../../models/vehicle.model';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Button } from '../../../../../shared/components/button/button';
import { InputFieldConfig } from '../../../../../shared/components/input-field/input-field.config';
import { ToastrService } from 'ngx-toastr';

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
      : { plateFormat: { message: 'Invalid Indian vehicle plate number format.' } };
  };
}

@Component({
  selector: 'app-vehicle-dialog',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDividerModule,
    MatIcon,
    MatSlideToggleModule,
    InputField,
    Button,
  ],

  templateUrl: './vehicle-dialog-component.html',
  styleUrl: './vehicle-dialog-component.scss',
})
export class VehicleDialogComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private vehicleService = inject(VehicleService);
  private dialogRef = inject(MatDialogRef<VehicleDialogComponent>);
  private destroy = new Subject<void>();
  private toastr = inject(ToastrService);

  form!: FormGroup;
  saving = false;

  vehicleNameConfig: InputFieldConfig = {
    label: 'Vehicle Name',
    type: 'text',
    placeholder: 'e.g. Tata Ace',
    minlength: 2,
    maxlength: 100,
    // subscriptSizing: 'fixed',
    trimStart: true,
  };

  plateNumberConfig: InputFieldConfig = {
    label: 'Plate Number',
    type: 'text',
    placeholder: 'e.g. MH12AB1234',
    subscriptSizing: 'dynamic',
    trimStart: true,
  };

  capacityConfig: InputFieldConfig = {
    label: 'Capacity (kg)',
    type: 'number',
    placeholder: 'e.g. 1000',
    min: 0.01,
    max: 100000,
    step: 0.01,
    subscriptSizing: 'dynamic',
  };

  get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  get title(): string {
    return this.isEdit ? 'Edit Vehicle' : 'Add Vehicle';
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: VehicleDialogData
  ) {}

  ngOnInit(): void {
    const vehicle = this.data.vehicle;

    this.form = this.fb.group({
      name: [
        vehicle?.name ?? '',
        [
          Validators.required,
          Validators.minLength(this.vehicleNameConfig.minlength!),
          Validators.maxLength(this.vehicleNameConfig.maxlength!),
        ],
      ],

      plateNumber: [vehicle?.plateNumber ?? '', [Validators.required, plateNumberValidator()]],

      capacityKg: [
        vehicle?.capacityKg ?? 0,
        [
          Validators.required,
          Validators.min(this.capacityConfig.min!),
          Validators.max(this.capacityConfig.max!),
        ],
      ],

      isAvailable: [vehicle?.isAvailable ?? true, [Validators.required]],
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  submit(): void {
    this.plateNumberConfig.label = 'hello';


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
        next: (res) => {
          console.log('API response:', res);
      
          this.toastr.success(
            this.isEdit
              ? 'Vehicle updated successfully.'
              : 'Vehicle added successfully.'
          );
      
          this.dialogRef.close({ saved: true });
        },
      
        error: (err) => {
          console.error(err);
      
          this.saving = false;
      
          this.toastr.error(
            this.isEdit
              ? 'Failed to update vehicle.'
              : 'Failed to add vehicle.'
          );
        },
      });
  }

  cancel(): void {
    this.dialogRef.close({ saved: false });
  }
}
