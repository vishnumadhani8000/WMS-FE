import { Component, DestroyRef, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Button } from '../../../../../shared/components/button/button';
import { InputFieldConfig } from '../../../../../shared/components/input-field/input-field.config';
import { ButtonConfig } from '../../../../../shared/components/button/button.config';
import { CityDialogData } from '../../models/state-city.model';
import { CityService } from '../../services/city-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface CityForm {
  name: FormControl<string>;
}

@Component({
  selector: 'app-city-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDividerModule,
    MatIcon,
    InputField,
    Button,
  ],
  templateUrl: './city-dialog-component.html',
  styleUrl: './city-dialog-component.scss',
})
export class CityDialogComponent implements OnInit{
  private cityService = inject(CityService);
  private dialogRef = inject(MatDialogRef<CityDialogComponent>);
  private toastr = inject(ToastrService);
  private destroyRef = inject(DestroyRef);

  form: FormGroup<CityForm>;
  saving = false;
  nameConfig: InputFieldConfig;
  cancelButtonConfig: ButtonConfig;
  submitButtonConfig: ButtonConfig;

  constructor(@Inject(MAT_DIALOG_DATA) public data: CityDialogData) {}

  get isEdit(): boolean {
    return this.data.mode === 'edit';
  }
  get title(): string {
    return this.isEdit ? 'Edit City' : 'Add City';
  }

  ngOnInit(): void {
    this.form = new FormGroup<CityForm>({
      name: new FormControl(this.data.city?.name ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      }),
    });

    this.nameConfig = {
      label: 'City Name',
      type: 'text',
      placeholder: 'e.g. Mumbai',
      minlength: 2,
      maxlength: 100,
      trimStart: true,
      control: this.form.controls.name,
    };

    this.cancelButtonConfig = {
      label: 'Cancel',
      variant: 'stroked',
      color: 'default',
      clicked: () => this.cancel(),
    };

    this.submitButtonConfig = {
      label: this.isEdit ? 'Save Changes' : 'Add City',
      variant: 'flat',
      color: 'primary',
      loading: this.saving,
      disabled: this.saving,
      clicked: () => this.submit(),
    };
  }



  submit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const value = this.form.getRawValue();

    const request = this.isEdit
      ? this.cityService.updateCity(this.data.city.id, { ...value, stateId: this.data.stateId })
      : this.cityService.createCity({ ...value, stateId: this.data.stateId });

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving = false;
        this.toastr.success(
          this.isEdit ? 'City updated successfully.' : 'City added successfully.'
        );
        this.dialogRef.close({ saved: true });
      },
      error: (err) => {
        this.saving = false;
        this.toastr.error(
          err?.error?.message || (this.isEdit ? 'Failed to update city.' : 'Failed to add city.')
        );
      },
    });
  }

  cancel(): void {
    this.dialogRef.close({ saved: false });
  }
}
