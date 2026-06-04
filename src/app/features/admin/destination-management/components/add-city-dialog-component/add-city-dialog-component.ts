import { Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Button } from '../../../../../shared/components/button/button';
import { SelectField } from '../../../../../shared/components/select-field/select-field';
import { InputFieldConfig } from '../../../../../shared/components/input-field/input-field.config';
import { ButtonConfig } from '../../../../../shared/components/button/button.config';
import { SelectFieldConfig } from '../../../../../shared/components/select-field/select-field.config';
import { AddCityDialogData } from '../../models/state-city.model';
import { CityService } from '../../services/city-service';

interface AddCityForm {
  name: FormControl<string>;
  stateId: FormControl<number>;
}

@Component({
  selector: 'app-add-city-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDividerModule,
    InputField,
    Button,
    SelectField,
  ],
  templateUrl: './add-city-dialog-component.html',
  styleUrl: './add-city-dialog-component.scss',
})
export class AddCityDialogComponent implements OnInit {
  public form: FormGroup<AddCityForm>;

  public nameConfig: InputFieldConfig;
  public stateSelectConfig: SelectFieldConfig;
  public cancelButtonConfig: ButtonConfig;
  public submitButtonConfig: ButtonConfig;
  public closeButtonConfig: ButtonConfig;

  constructor(
    private readonly cityService: CityService,
    private readonly dialogRef: MatDialogRef<AddCityDialogComponent>,
    private readonly toastr: ToastrService,
    private readonly destroyRef: DestroyRef,
    @Inject(MAT_DIALOG_DATA) public data: AddCityDialogData
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  public get selectedStateName(): string {
    const id: number = this.form.controls.stateId.value;

    return (
      this.data.states.find((s) => s.id === id)?.name ??
      this.data.selectedState.name
    );
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, stateId } = this.form.getRawValue();

    this.cityService
      .createCity({ name, stateId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('City added successfully.');
          this.dialogRef.close({ saved: true, stateId });
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
    this.form = new FormGroup<AddCityForm>({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      }),
      stateId: new FormControl<number>(this.data.selectedState.id, {
        nonNullable: true,
        validators: [Validators.required],
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

    this.stateSelectConfig = {
      label: 'State',
      control: this.form.controls.stateId,
      required: true,
      options: this.data.states.map((s) => ({
        label: s.name,
        value: s.id,
      })),
    };

    this.cancelButtonConfig = {
      label: 'Cancel',
      variant: 'stroked',
      color: 'default',
      clicked: () => this.cancel(),
    };

    this.submitButtonConfig = {
      label: 'Add City',
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