import { EventEmitter } from "@angular/core";
import { FormControl } from "@angular/forms";

export interface InputFieldConfig {
    reruired?: boolean;
    
    label: string;

    control: FormControl;
  
    type?: 'text' | 'password' | 'email' | 'number';
  
    placeholder?: string ;
  
    appearance?: 'outline' | 'fill';
  
    minlength?: number;
  
    maxlength?: number;
  
    min?: number;
  
    max?: number;
  
    step?: number;
  
    pattern?: string;
  
    iconPath?: string;
  
    icon?: string;
  
    prefixIcon?: string;
  
    hint?: string;
  
    readonly?: boolean;
  
    trimStart?: boolean;   
  
    subscriptSizing?: 'fixed' | 'dynamic';
  
    customErrorMessage?: string;

    iconClick?: () => void;
  }