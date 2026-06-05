import { Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InputField } from '../../../../../shared/components/input-field/input-field';
import { InputFieldConfig } from '../../../../../shared/components/input-field/input-field.config';
import { ButtonConfig } from '../../../../../shared/components/button/button.config';
import { StateDialogData, StateForm } from '../../models/state-city.model';
import { StateService } from '../../services/state-service';
import { FormDialog } from "../../../../../shared/components/form-dialog/form-dialog";

@Component({
  selector: 'app-state-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDividerModule,
    InputField,
    FormDialog
],
  templateUrl: './state-dialog-component.html',
  styleUrl: './state-dialog-component.scss',
})
export class StateDialogComponent implements OnInit {
  public form: FormGroup<StateForm>;
  public nameConfig: InputFieldConfig;
  public cancelButtonConfig: ButtonConfig;
  public submitButtonConfig: ButtonConfig;
  public closeButtonConfig: ButtonConfig;

  constructor(
    private readonly stateService: StateService,
    private readonly dialogRef: MatDialogRef<StateDialogComponent>,
    private readonly toastr: ToastrService,
    private readonly destroyRef: DestroyRef,
    @Inject(MAT_DIALOG_DATA) public data: StateDialogData
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  public get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  public get title(): string {
    return this.isEdit ? 'Edit State' : 'Add State';
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const request = this.isEdit
      ? this.stateService.updateState(this.data.state.id, value)
      : this.stateService.createState(value);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toastr.success(
          this.isEdit ? 'State updated successfully.' : 'State added successfully.'
        );
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
    this.form = new FormGroup<StateForm>({
      name: new FormControl(this.data.state?.name ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      }),
    });
  }

  private initializeConfigs(): void {
    this.nameConfig = {
      label: 'State Name',
      type: 'text',
      placeholder: 'e.g. Maharashtra',
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
      label: this.isEdit ? 'Save Changes' : 'Add State',
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