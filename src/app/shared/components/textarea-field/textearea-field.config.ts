import { FormControl } from "@angular/forms";

export interface TextareaFieldConfig {

  label: string;

  control?: FormControl;

  required?: boolean;

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