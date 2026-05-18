import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { SelectFieldConfig } from './select-field.config';

@Component({
  selector: 'app-common-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatIconModule],
  templateUrl: './select-field.html',
  styleUrl: './select-field.scss',
})
export class SelectField {
  @Input({ required: true })
  config!: SelectFieldConfig;

  get isRequired(): boolean {
    return this.config.required || !!this.config.control?.hasValidator(Validators.required);
  }

  markTouched(): void {
    this.config.control?.markAsTouched();
  }

  markDirty(): void {
    this.config.control?.markAsDirty();
    this.config.control?.updateValueAndValidity();
  }

  get errorMessage(): string {
    if (this.config.customErrorMessage) {
      return this.config.customErrorMessage;
    }

    const control = this.config.control;

    if (!control?.errors) {
      return '';
    }

    const e = control.errors;

    if (e['required']) {
      return `${this.config.label} is required.`;
    }

    return 'Invalid field.';
  }
}
