import { FormControl } from '@angular/forms';

export interface UserProfile {
  id: number;

  name: string;

  email: string;

  phone: string | null;

  role: string;

  isActive: boolean;
}

export interface EditProfileDialogData {
  profile: UserProfile;
}

export interface ProfileForm {
  name: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  role: FormControl<string>;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  name: string;
  phone: string;
}
