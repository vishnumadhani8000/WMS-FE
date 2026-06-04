export interface InputFieldConfig {

  formControlName?: string;

  label: string;

  type?: 'text' | 'password' | 'email' | 'number';

  placeholder?: string;

  appearance?: 'outline' | 'fill';

  minlength?: number;

  maxlength?: number;

  min?: number;

  max?: number;

  step?: number;

  pattern?: string;

  prefixIcon?: string;

  icon?: string;

  iconPath?: string;

  hint?: string;

  readonly?: boolean;

  trimStart?: boolean;
    
  disabled?: boolean;
  
  autocomplete?: string;

  iconClick?: () => void;
}