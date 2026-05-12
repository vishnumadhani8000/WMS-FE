// input-field.ts

import { Component, Input, Output, EventEmitter, Optional, Self, ViewChild, AfterViewInit, OnDestroy, DoCheck, inject, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule, } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject, Subscription } from 'rxjs';

type InputValue = string | number | null;

type MatInputWithStateChanges =
  MatInput & { stateChanges?: Subject<void> };

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

export class InputField implements ControlValueAccessor, AfterViewInit, OnDestroy, DoCheck {

  @Input() label = '';
  @Input() type: 'text' | 'password' | 'email' | 'number' = 'text';
  @Input() placeholder = '';
  @Input() appearance: 'outline' | 'fill' = 'outline';
  @Input() minlength?: number;
  @Input() maxlength?: number;
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  @Input() pattern?: string;
  @Input() iconPath?: string;
  @Input() icon?: string;
  @Input() prefixIcon?: string;
  @Input() hint?: string;
  @Input() readonly = false;
  @Input() subscriptSizing: 'fixed' | 'dynamic' = 'fixed';
  @Input() customErrorMessage?: string;
  @Output() iconClick = new EventEmitter<void>();
  @ViewChild(MatInput) matInput!: MatInput;

  value: InputValue = '';
  disabled = false;
  showPassword = false;

  private subscription = new Subscription();
  private wasTouched = false;

  onChange: (val: InputValue) => void = () => { };
  onTouched: () => void = () => { };

  readonly ngControl = inject(NgControl, { optional: true, self: true, });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get isRequired(): boolean {
    return !!this.ngControl?.control?.hasValidator?.(Validators.required);
  }


  get inputType(): string {
    return this.type === 'password'
      ? this.showPassword ? 'text' : 'password'
      : this.type;
  }


  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }


  ngDoCheck(): void {
    const isTouched = !!this.ngControl?.control?.touched;
    if (isTouched !== this.wasTouched) {
      this.wasTouched = isTouched;
      (this.matInput as MatInputWithStateChanges)?.stateChanges?.next();
    }
  }


  ngAfterViewInit(): void {
    if (!this.ngControl?.control || !this.matInput) {
      return;
    }
    this.subscription.add(
      this.ngControl.control.statusChanges.subscribe(() => {

        (this.matInput as MatInputWithStateChanges)?.stateChanges?.next();
      })
    );

    Object.defineProperty(this.matInput, 'errorState', {

      get: () => {
        const control = this.ngControl?.control;
        const isInteracted = !!(control?.touched || control?.dirty);
        const hasErrors = !!(control?.invalid && isInteracted);
        const hasCustom = !!(this.customErrorMessage && isInteracted);
        return hasErrors || hasCustom;
      },
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleInputEvent(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.handleInput(target?.value ?? '');
  }

  handleInput(value: string): void {
    let processed: InputValue = value;
    if (this.type === 'number' && value !== '') {
      const num = parseFloat(value);

      if (!isNaN(num)) {

        processed = this.step !== undefined
          ? parseFloat(
            num.toFixed(
              (this.step.toString().split('.')[1] ?? '').length
            )
          )
          : num;
      }
    }

    this.value = processed;
    this.onChange(processed);

    if (!this.ngControl?.control) {
      return;
    }
    this.ngControl.control.markAsDirty();
    this.ngControl.control.updateValueAndValidity();
    (this.matInput as MatInputWithStateChanges)?.stateChanges?.next();
  }

  markTouched(): void {

    if (!this.ngControl?.control) {
      return;
    }

    if (typeof this.value === 'string') {
      const trimmed = this.value.trim();

      if (trimmed !== this.value) {
        this.value = trimmed;
        this.onChange(trimmed);
        this.ngControl.control.setValue(trimmed, {
          emitEvent: false,
        });
      }
    }

    this.ngControl.control.markAsTouched();
    (this.matInput as MatInputWithStateChanges)?.stateChanges?.next();
  }

  handleIconClick(): void {
    this.iconClick.emit();
  }

  get errorMessage(): string {
    const control = this.ngControl?.control;

    if (!control) {
      return '';
    }

    if (this.customErrorMessage && (control.touched || control.dirty)) {
      return this.customErrorMessage;
    }

    if (!control.errors) {
      return '';
    }

    const e = control.errors;

    if (e['required']) {
      return `${this.label || 'This field'} is required.`;
    }
    if (e['whitespace']) {
      return 'This field cannot be empty or spaces only.';
    }
    if (e['email']) {
      return 'Please enter a valid email address.';
    }
    if (e['minlength']) {
      return `Minimum ${e['minlength'].requiredLength} characters required.`;
    }
    if (e['maxlength']) {
      return `Maximum ${e['maxlength'].requiredLength} characters allowed.`;
    }
    if (e['min']) {
      return `Minimum value is ${e['min'].min}.`;
    }
    if (e['max']) {
      return `Maximum value is ${e['max'].max}.`;
    }
    if (e['pattern']) {
      return `Invalid ${this.label.toLowerCase() || 'format'}.`;
    }
    const firstKey = Object.keys(e)[0];
    return e[firstKey]?.message ?? 'Invalid field.';
  }

  writeValue(value: InputValue): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (v: InputValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}