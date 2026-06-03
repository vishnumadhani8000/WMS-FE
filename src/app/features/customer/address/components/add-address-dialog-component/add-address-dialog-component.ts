import { Component, DestroyRef, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Button } from '../../../../../shared/components/button/button';
import { SelectField } from '../../../../../shared/components/select-field/select-field';
import { InputFieldConfig } from '../../../../../shared/components/input-field/input-field.config';
import { ButtonConfig } from '../../../../../shared/components/button/button.config';
import { SelectFieldConfig } from '../../../../../shared/components/select-field/select-field.config';
import {
  AddAddressDialogData,
  AddAddressDialogResult,
} from '../../models/addAddressDialogData.model';
import { AddressService } from '../../services/address.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface AddressForm {
  addressLine: FormControl<string>;
  landmark: FormControl<string>;
  stateId: FormControl<number | null>;
  cityId: FormControl<number | null>;
  pincode: FormControl<string>;
}

@Component({
  selector: 'app-add-address-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    InputField,
    Button,
    SelectField,
  ],
  templateUrl: './add-address-dialog-component.html',
  styleUrl: './add-address-dialog-component.scss',
})
export class AddAddressDialogComponent implements OnInit {

  form: FormGroup<AddressForm>;

  addressLineConfig: InputFieldConfig;
  landmarkConfig: InputFieldConfig;
  pincodeConfig: InputFieldConfig;
  stateConfig: SelectFieldConfig;
  cityConfig: SelectFieldConfig;

  cancelButtonConfig: ButtonConfig;
  saveButtonConfig: ButtonConfig;
  closeButtonConfig: ButtonConfig;


  constructor(
    private readonly statesCitiesService: AddressService,
    private readonly userAddressService: AddressService,
    private readonly dialogRef: MatDialogRef<AddAddressDialogComponent>,
    private readonly destroyref : DestroyRef,
  
    @Inject(MAT_DIALOG_DATA)
    public data: AddAddressDialogData
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initConfigs();
    this.loadStates();
  }

  private initForm(): void {
    this.form = new FormGroup<AddressForm>({
      addressLine: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(200)],
      }),
      landmark: new FormControl('', {
        nonNullable: true,
        validators: [Validators.maxLength(100)],
      }),
      stateId: new FormControl<number | null>(null, {
        validators: [Validators.required],
      }),
      cityId: new FormControl<number | null>(null, {
        validators: [Validators.required],
      }),
      pincode: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^\d{6}$/)],
      }),
    });

    this.form.controls.stateId.valueChanges.pipe(takeUntilDestroyed(this.destroyref)).subscribe((stateId) => {
          this.loadCities(stateId);
    });
  }

  private initConfigs(): void {
    this.addressLineConfig = {
      label: 'Address Line',
      type: 'text',
      placeholder: 'e.g. 123 Main Street, Apartment 4B',
      maxlength: 200,
      trimStart: true,
      formControlName: 'addressLine'
    };

    this.landmarkConfig = {
      label: 'Landmark',
      type: 'text',
      placeholder: 'e.g. Near Central Park',
      maxlength: 100,
      trimStart: true,
      formControlName:'landmark',
    };

    this.pincodeConfig = {
      label: 'Pincode',
      type: 'text',
      placeholder: 'e.g. 400001',
      maxlength: 6,
      formControlName: 'pincode'
    };

    this.stateConfig = {
      label: 'State',
      options: [],
      subscriptSizing: 'dynamic',
      control: this.form.controls.stateId,
    };

    this.cityConfig = {
      label: 'City',
      options: [],
      subscriptSizing: 'dynamic',
      control: this.form.controls.cityId,
    };

    this.closeButtonConfig = {
      ariaLabel: 'Close',
      prefixIcon: 'close',
      variant: 'stroked',
      clicked: () => this.cancel(),
    };

    this.cancelButtonConfig = {
      label: 'Cancel',
      variant: 'stroked',
      color: 'default',
      clicked: () => this.cancel(),
    };

    this.saveButtonConfig = {
      label: 'Save & Continue',
      variant: 'flat',
      color: 'primary',
      clicked: () => this.save(),
    };
  }

  private loadStates(): void {
    this.statesCitiesService
      .getStates()
      .pipe(takeUntilDestroyed(this.destroyref))
      .subscribe({
        next: (states) => {
          this.stateConfig = { ...this.stateConfig, options: states };
        },
      });
  }

  private loadCities(state: number): void {
    this.statesCitiesService
      .getCitiesByState(state)
      .pipe(takeUntilDestroyed(this.destroyref))
      .subscribe({
        next: (cities) => {
          this.cityConfig = { ...this.cityConfig, options: cities };
        },
      });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

  
    const formValue = this.form.getRawValue();
  
    const payload = {
      addressLine: formValue.addressLine,
      landmark: formValue.landmark,
      stateId: formValue.stateId,
      cityId: formValue.cityId,
      pincode: formValue.pincode,
    };
  
    this.userAddressService
      .createAddress(payload)
      .pipe(takeUntilDestroyed(this.destroyref))
      .subscribe({
        next: (res) => {
          if (!res.isSuccess) {
            return;
          }
          this.dialogRef.close({
            saved: true,
            address: res.data,
          });
        },
  
      });
  }
  cancel(): void {
    this.dialogRef.close({ saved: false } as AddAddressDialogResult);
  }

}
