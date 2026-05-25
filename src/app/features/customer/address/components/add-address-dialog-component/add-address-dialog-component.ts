import { Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
import { AddressData } from '../../models/addresh.model';
import { AddressService } from '../../services/address.service';

interface AddressForm {
  addressLine: FormControl<string>;
  landmark: FormControl<string>;
  state: FormControl<number | null>;
  city: FormControl<number | null>;
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
export class AddAddressDialogComponent implements OnInit, OnDestroy {
  private statesCitiesService = inject(AddressService);
  private dialogRef = inject(MatDialogRef<AddAddressDialogComponent>);
  private userAddressService = inject(AddressService);
  private destroy = new Subject<void>();

  saving = false;
  loadingStates = false;
  loadingCities = false;

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
      state: new FormControl<number | null>(null, {
        validators: [Validators.required],
      }),
      city: new FormControl<number | null>(null, {
        validators: [Validators.required],
      }),
      pincode: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^\d{6}$/)],
      }),
    });

    this.form.controls.state.valueChanges.pipe(takeUntil(this.destroy)).subscribe((state) => {
      this.form.controls.city.reset(null);
      this.cityConfig = { ...this.cityConfig, options: [] };
      if (state) {
        this.loadCities(state);
      }
    });
  }

  private initConfigs(): void {
    this.addressLineConfig = {
      label: 'Address Line',
      type: 'text',
      placeholder: 'e.g. 123 Main Street, Apartment 4B',
      maxlength: 200,
      subscriptSizing: 'dynamic',
      trimStart: true,
      control: this.form.controls.addressLine,
    };

    this.landmarkConfig = {
      label: 'Landmark',
      type: 'text',
      placeholder: 'e.g. Near Central Park',
      maxlength: 100,
      subscriptSizing: 'dynamic',
      trimStart: true,
      control: this.form.controls.landmark,
    };

    this.pincodeConfig = {
      label: 'Pincode',
      type: 'text',
      placeholder: 'e.g. 400001',
      maxlength: 6,
      subscriptSizing: 'dynamic',
      control: this.form.controls.pincode,
    };

    this.stateConfig = {
      label: 'State',
      options: [],
      subscriptSizing: 'dynamic',
      control: this.form.controls.state,
    };

    this.cityConfig = {
      label: 'City',
      options: [],
      subscriptSizing: 'dynamic',
      control: this.form.controls.city,
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
      loading: this.saving,
      disabled: this.saving,
      clicked: () => this.save(),
    };
  }

  private loadStates(): void {
    this.loadingStates = true;
    this.statesCitiesService
      .getStates()
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (states) => {
          this.stateConfig = { ...this.stateConfig, options: states };
          this.loadingStates = false;
        },
        error: () => {
          this.loadingStates = false;
        },
      });
  }

  private loadCities(state: number): void {
    this.loadingCities = true;
    this.statesCitiesService
      .getCitiesByState(state)
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (cities) => {
          this.cityConfig = { ...this.cityConfig, options: cities };
          this.loadingCities = false;
        },
        error: () => {
          this.loadingCities = false;
        },
      });
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    this.saveButtonConfig = {
      ...this.saveButtonConfig,
      loading: true,

    };

    const formValue = this.form.getRawValue();

    const payload = {
      addressLine: formValue.addressLine,
      landmark: formValue.landmark,
      stateId: formValue.state,
      cityId: formValue.city,
      pincode: formValue.pincode,
    };

    this.userAddressService
      .createAddress(payload)
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (res) => {
          this.saving = false;
          this.saveButtonConfig = {
            ...this.saveButtonConfig,
            loading: false,
            disabled: false,
          };

          if (!res.isSuccess) {
            return;
          }

          this.dialogRef.close({
            saved: true,
            address: res.data,
          });
        },

        error: () => {
          this.saving = false;
          this.saveButtonConfig = {
            ...this.saveButtonConfig,
            loading: false,
            disabled: false,
          };
        },
      });
  }
  cancel(): void {
    this.dialogRef.close({ saved: false } as AddAddressDialogResult);
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
