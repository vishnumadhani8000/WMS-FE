import { Component, DestroyRef, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Button } from '../../../../../shared/components/button/button';
import { InputFieldConfig } from '../../../../../shared/components/input-field/input-field.config';
import { ButtonConfig } from '../../../../../shared/components/button/button.config';
import { CityForm, EditCityDialogData } from '../../models/state-city.model';
import { CityService } from '../../services/city-service';

@Component({
  selector: 'app-city-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDividerModule,
    InputField,
    Button,
  ],
  templateUrl: './city-dialog-component.html',
  styleUrl: './city-dialog-component.scss',
})
export class CityDialogComponent implements OnInit {
  public form: FormGroup<CityForm>;
  public nameConfig: InputFieldConfig;
  public cancelButtonConfig: ButtonConfig;
  public submitButtonConfig: ButtonConfig;
  public closeButtonConfig: ButtonConfig;

  constructor(
    private readonly cityService: CityService,
    private readonly dialogRef: MatDialogRef<CityDialogComponent>,
    private readonly toastr: ToastrService,
    private readonly destroyRef: DestroyRef,
    @Inject(MAT_DIALOG_DATA) public data: EditCityDialogData
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cityService
      .updateCity(this.data.city.id, this.form.getRawValue().name)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('City updated successfully.');
          this.dialogRef.close({ saved: true });
        },
      });
  }

  public cancel(): void {
    this.dialogRef.close({ saved: false });
  }

  private initializeComponent(): void {
    this.initializeForm();
    this.initializeConfigs();
  }

  private initializeForm(): void {
    this.form = new FormGroup<CityForm>({
      name: new FormControl(this.data.city.name, {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      }),
    });
  }

  private initializeConfigs(): void {
    this.nameConfig = {
      label: 'City Name',
      type: 'text',
      placeholder: 'e.g. Mumbai',
      minlength: 2,
      maxlength: 100,
      trimStart: true,
      formControlName: 'name',
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
      clicked: () => this.submit(),
    };

    this.closeButtonConfig = {
      prefixIcon: 'close',
      variant: 'stroked',
      clicked: () => this.cancel(),
    };
  }
}