import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TextareaFieldConfig } from './textearea-field.config';

@Component({
  selector: 'app-common-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './textarea-field.html',
  styleUrl: './textarea-field.scss',
})
export class TextareaField {
  @Input({ required: true })
  config: TextareaFieldConfig;

  get isRequired(): boolean {
    return this.config.required || !!this.config.control?.hasValidator(Validators.required);
  }

  trimAndTouch(): void {
    const control = this.config.control;

    if (!control) return;

    const trimmed = (control.value || '').trim();

    if (trimmed !== control.value) {
      control.setValue(trimmed);
    }

    control.markAsTouched();
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

    if (e['minlength']) {
      return `Minimum ${e['minlength'].requiredLength} characters required.`;
    }

    if (e['maxlength']) {
      return `Maximum ${e['maxlength'].requiredLength} characters allowed.`;
    }

    return 'Invalid field.';
  }
}
