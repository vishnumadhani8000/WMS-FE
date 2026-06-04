import { FormControl } from "@angular/forms";

export interface LoginForm {
    email: FormControl<string>;
    password: FormControl<string>;
  }
  
export interface SignUpForm {
    name: FormControl<string>;
    email: FormControl<string>;
    phone: FormControl<string>;
    password: FormControl<string>;
    confirmPassword: FormControl<string>;
  }
  