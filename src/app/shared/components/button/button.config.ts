export type ButtonVariant = 'raised' | 'flat' | 'stroked'| 'icon'; 

export type ButtonColor =
  | 'primary'
  | 'accent'
  | 'warn'
  | 'default';

export interface ButtonConfig {
  label?: string;

  variant?: ButtonVariant;

  color?: ButtonColor;

  fullWidth?: boolean;

  disabled?: boolean;

  loading?: boolean;

  prefixIcon?: string;

  suffixIcon?: string;

  iconPath?: string;

  ariaLabel?: string;

  clicked?: () => void;
}