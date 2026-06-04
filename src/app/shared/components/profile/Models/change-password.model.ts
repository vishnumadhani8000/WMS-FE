import { FormControl } from "@angular/forms";

export interface ChangePasswordForm {
    currentPassword: FormControl<string>;
    newPassword: FormControl<string>;
    confirmPassword: FormControl<string>;
  }