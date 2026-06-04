import { FormControl } from '@angular/forms';

export interface TextareaFieldConfig {
  label: string;

  formControlName: string;

  placeholder?: string;

  rows?: number;

  hint?: string;

  prefixIcon?: string;

  appearance?: 'outline' | 'fill';

  subscriptSizing?: 'fixed' | 'dynamic';

  readonly?: boolean;

  trimStart?: boolean;

  maxlength?: number;

  customErrorMessage?: string;
}