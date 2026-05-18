
import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ButtonConfig } from './button.config';

export type ButtonVariant = 'raised' | 'flat' | 'stroked';
export type ButtonColor   = 'primary' | 'accent' | 'warn' | 'default';

@Component({
  selector: 'app-common-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  @Input({ required: true })
  config!: ButtonConfig;

  handleClick(event: MouseEvent): void {
    if (this.config.disabled || this.config.loading) return;
    this.config.clicked?.();
  }

  get isDisabled(): boolean {
    return this.config.disabled || this.config.loading;
  }

  get hostClass(): string {
    return this.config.fullWidth ? 'full-width' : '';
  }
}