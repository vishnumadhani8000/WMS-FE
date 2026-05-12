import { CommonModule } from '@angular/common';

import {
  Component,
  Input,
  Optional,
  Self,
  ViewChild,
  AfterViewInit
} from '@angular/core';

import {
  ControlValueAccessor,
  NgControl,
  ReactiveFormsModule
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';

import {
  MatSelect,
  MatSelectModule
} from '@angular/material/select';

import { MatIconModule } from '@angular/material/icon';

type SelectValue = string | number | null;

interface SelectOption {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-common-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './select-field.html',
  styleUrl: './select-field.scss'
})

export class SelectField
implements ControlValueAccessor, AfterViewInit {
  
  @Input()label = '';
  @Input()hint = '';
  @Input()prefixIcon = '';
  @Input()appearance: 'outline' | 'fill' = 'outline';
  @Input()subscriptSizing: 'fixed' | 'dynamic' = 'fixed';
  @Input()options: SelectOption[] = [];

  @ViewChild(MatSelect)matSelect!: MatSelect;

  value: SelectValue = null;

  disabled = false;
  onChange: (value: SelectValue) => void = () => {};

  onTouched: () => void = () => {};

  constructor(
    @Optional()
    @Self()
    public ngControl: NgControl
  ) {

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }


  ngAfterViewInit(): void {

    Object.defineProperty(this.matSelect, 'errorState', {

      get: () => {

        const control = this.ngControl?.control;

        return !!(
          control &&
          control.invalid &&
          (control.touched || control.dirty)
        );
      }
    });
  }

  handleSelection(value: SelectValue): void {

    this.value = value;

    this.onChange(value);

    if (this.ngControl?.control) {

      this.ngControl.control.markAsDirty();

      this.ngControl.control.updateValueAndValidity();
    }
  } 
  markTouched(): void {

    if (this.ngControl?.control) {

      this.ngControl.control.markAsTouched();
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
    return 'Invalid field.';
  }


  writeValue(value: SelectValue): void {
    this.value = value;
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