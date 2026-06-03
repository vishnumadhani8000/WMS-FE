import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InputFieldConfig } from './input-field.config';

@Component({
  selector: 'app-common-input',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],

  templateUrl: './input-field.html',

  styleUrl: './input-field.scss',
})
export class InputField {
  @Input({ required: true }) config: InputFieldConfig;
  showPassword = false;
  constructor(private controlContainer: ControlContainer) {
  }
  ngOnInit(): void {
    if (this.config.disabled) {
      this.control.disable({ emitEvent: false });
    }
  }

  get control(): FormControl {
    return this.controlContainer.control?.get(this.config.formControlName) as FormControl;
  }

  get inputType(): string {
    if (this.config.type !== 'password') {
      return this.config.type || 'text';
    }

    return this.showPassword ? 'text' : 'password';
  }

  get isRequired(): boolean {
    return this.control.hasValidator(Validators.required);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  handleInput(event: Event): void {
    if (!this.config.trimStart) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const value = input.value.trimStart();
    this.control.setValue(value, {
      emitEvent: false,
    });

    input.value = value;
  }

  handleIconClick(): void {
    this.config.iconClick?.();
  }

  get errorMessage(): string {
 
  
    const errors = this.control.errors;
  
    if (!errors) {
      return '';
    }
  
    
    const firstErrorKey = Object.keys(errors)[0];
    const firstError = errors[firstErrorKey];
  
    if (firstError?.message) {
      return firstError.message;
    }

    if (errors['required']) {
      return `${this.config.label} is required`;
    }
  
    if (errors['email']) {
      return 'Invalid email';
    }
  
    if (errors['minlength']) {
      return `Minimum ${errors['minlength'].requiredLength} characters`;
    }
  
    if (errors['maxlength']) {
      return `Maximum ${errors['maxlength'].requiredLength} characters`;
    }
  
    if (errors['min']) {
      return `Minimum value is ${errors['min'].min}`;
    }
  
    if (errors['max']) {
      return `Maximum value is ${errors['max'].max}`;
    }
  
    return 'Invalid field';
  }
}
