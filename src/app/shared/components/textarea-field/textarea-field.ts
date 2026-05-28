import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
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

  constructor(private controlContainer: ControlContainer) {}

  get control(): FormControl {
    return this.controlContainer.control?.get(this.config.formControlName) as FormControl;
  }

  get isRequired(): boolean {
    return this.control.hasValidator(Validators.required);
  }

  handleInput(event: Event): void {
    if (!this.config.trimStart) {
      return;
    }

    const input = event.target as HTMLTextAreaElement;

    const value = input.value.trimStart();

    this.control.setValue(value, {
      emitEvent: false,
    });

    input.value = value;
  }

  get errorMessage(): string {
    if (this.config.customErrorMessage) {
      return this.config.customErrorMessage;
    }

    const errors = this.control.errors;

    if (!errors) {
      return '';
    }

    const firstKey = Object.keys(errors)[0];
    const firstError = errors[firstKey];

    // Custom validator message
    if (firstError?.message) {
      return firstError.message;
    }

    // Default validators
    if (errors['required']) {
      return `${this.config.label} is required`;
    }

    if (errors['minlength']) {
      return `Minimum ${errors['minlength'].requiredLength} characters required`;
    }

    if (errors['maxlength']) {
      return `Maximum ${errors['maxlength'].requiredLength} characters allowed`;
    }

    return 'Invalid field';
  }
}
