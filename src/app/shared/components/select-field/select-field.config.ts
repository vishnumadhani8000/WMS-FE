import { FormControl } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectFieldConfig {
  label: string;

  control?: FormControl;

  options: SelectOption[];

  required?: boolean;

  hint?: string;

  prefixIcon?: string;

  appearance?: 'outline' | 'fill';

  subscriptSizing?: 'fixed' | 'dynamic';

  customErrorMessage?: string;
} 