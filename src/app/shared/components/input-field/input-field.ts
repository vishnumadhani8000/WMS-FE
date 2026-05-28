import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InputFieldConfig } from './input-field.config';

@Component({
  selector: 'app-common-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './input-field.html',
  styleUrl: './input-field.scss',
})
export class InputField {
  @Input({ required: true }) config: InputFieldConfig;

  showPassword = false;

  get isRequired(): boolean {
    return this.config.control.hasValidator(Validators.required);
  }

  get inputType(): string {
    if (this.config.type !== 'password') return this.config.type;
    return this.showPassword ? 'text' : 'password';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  handleInput(event: Event): void {

    if(this.config.trimStart===undefined||this.config.trimStart===false){return;}
    const input = event.target as HTMLInputElement;

    let value = input.value;

    if (this.config.trimStart === true) {
      value = value.trimStart();
    }

      this.config.control?.setValue(value, {
        emitEvent: false,
      });

    input.value = value;
  }
  handleIconClick(): void {
    this.config.iconClick?.();
  }

  get errorMessage(): string {
    if (this.config.customErrorMessage) return this.config.customErrorMessage;
    if (!this.config.control.errors) return '';

    const e = this.config.control.errors;
    if (e['required']) return `${this.config.label || 'This field'} is required.`;
    if (e['whitespace']) return 'This field cannot be empty or spaces only.';
    if (e['email']) return 'Please enter a valid email address.';
    if (e['minlength']) return `Minimum ${e['minlength'].requiredLength} characters required.`;
    if (e['maxlength']) return `Maximum ${e['maxlength'].requiredLength} characters allowed.`;
    if (e['min']) return `Minimum value is ${e['min'].min}.`;
    if (e['max']) return `Maximum value is ${e['max'].max}.`;
    if (e['pattern']) {
      return this.config.type === 'password'
        ? 'Use uppercase, lowercase, number & special character.'
        : `Invalid ${this.config.label?.toLowerCase() || 'format'}.`;
    }
    const firstKey = Object.keys(e)[0];
    return e[firstKey]?.message ?? 'Invalid field.';
  }
}
