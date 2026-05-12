// ─────────────────────────────────────────────────────────
// common-button.component.ts
// Path: src/app/shared/components/common-button/
// ─────────────────────────────────────────────────────────

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

  @Input() label                  = '';
  @Input() variant: ButtonVariant = 'raised';
  @Input() color: ButtonColor     = 'primary';
  @Input() fullWidth              = false;
  @Input() disabled               = false;
  @Input() loading                = false;
  @Input() prefixIcon             = '';
  @Input() suffixIcon             = '';
  @Input() iconPath               = '';
  @Input() ariaLabel              = '';

  @Output() clicked = new EventEmitter<MouseEvent>();

  handleClick(event: MouseEvent): void {
    if (this.disabled || this.loading) return;
    this.clicked.emit(event);
  }

  get isDisabled(): boolean {
    return this.disabled || this.loading;
  }

  get hostClass(): string {
    return this.fullWidth ? 'full-width' : '';
  }
}