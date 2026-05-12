import { CommonModule } from '@angular/common';

import {
  Component,
  Input,
  Optional,
  Self,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  DoCheck,
  inject
} from '@angular/core';

import {
  ControlValueAccessor,
  NgControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Subject, Subscription } from 'rxjs';

type MatInputWithStateChanges =
  MatInput & { stateChanges?: Subject<void> };

@Component({
  selector: 'app-common-textarea',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './textarea-field.html',
  styleUrl: './textarea-field.scss'
})
export class TextareaField implements ControlValueAccessor, AfterViewInit, OnDestroy, DoCheck {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() rows = 4;
  @Input() hint = '';
  @Input() prefixIcon = '';
  @Input() appearance: 'outline' | 'fill' = 'outline';
  @Input() subscriptSizing: 'fixed' | 'dynamic' = 'fixed';
  @Input() readonly = false;
  @Input() maxlength?: number;

  @ViewChild(MatInput)
  matInput!: MatInput;

  value = '';
  disabled = false;
  private subscription = new Subscription();
  private wasTouched = false;
  onChange: (value: string) => void = () => { };
  onTouched: () => void = () => { };

  readonly ngControl = inject(NgControl, { optional: true, self: true, });
  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get isRequired(): boolean {
    return !!this.ngControl?.control ?.hasValidator?.(Validators.required);
  }

  ngDoCheck(): void {
    const isTouched = !!this.ngControl?.control?.touched;

    if (isTouched !== this.wasTouched) {
      this.wasTouched = isTouched;
      (this.matInput as MatInputWithStateChanges)?.stateChanges?.next();
    }
  }

  ngAfterViewInit(): void {
    if (this.ngControl?.control && this.matInput) {
      this.subscription.add(
        this.ngControl.control.statusChanges.subscribe(() => {
          (this.matInput as MatInputWithStateChanges)?.stateChanges?.next();
        })
      );

      Object.defineProperty(
        this.matInput,
        'errorState',
        {
          get: () => {
            const control = this.ngControl?.control;
            return !!( control &&control.invalid &&(control.touched || control.dirty));
          }
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleInput(event: Event): void {
    const value =(event.target as HTMLTextAreaElement).value;
    this.value = value;
    this.onChange(value);

    if (this.ngControl?.control) {
      this.ngControl.control.markAsDirty();
      this.ngControl.control.updateValueAndValidity();
      (this.matInput as MatInputWithStateChanges)?.stateChanges?.next();
    }
  }

  markTouched(): void {

    if (this.ngControl?.control) {

      const trimmed = this.value.trim();

      if (trimmed !== this.value) {
        this.value = trimmed;
        this.onChange(trimmed);
        this.ngControl.control.setValue(
          trimmed,
          { emitEvent: false }
        );
      }
      this.ngControl.control.markAsTouched();
      (this.matInput as MatInputWithStateChanges)?.stateChanges?.next();
    }
  }

  get errorMessage(): string {
    const control = this.ngControl?.control;
    if (!control ||!control.errors ||!(control.touched || control.dirty)) {
      return '';
    }

    const e = control.errors;

    if (e['required']) {
      return `${this.label} is required.`;
    }
    if (e['minlength']) {
      return `Minimum ${e['minlength'].requiredLength} characters required.`;
    }
    if (e['maxlength']) {
      return `Maximum ${e['maxlength'].requiredLength} characters allowed.`;
    }

    return 'Invalid field.';
  }

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}