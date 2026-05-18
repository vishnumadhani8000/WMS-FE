import { Component, Inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { MatIconModule } from '@angular/material/icon';

import { ConfirmDialogData } from './confirm-dialog.model';

import { Button } from '../button/button';
import { ButtonConfig } from '../button/button.config';

@Component({
  selector: 'app-confirm-dialog',

  standalone: true,

  templateUrl: './confirm-dialog.html',

  styleUrl: './confirm-dialog.scss',

  imports: [CommonModule, MatDialogModule, MatIconModule, Button],
})
export class ConfirmDialog {
  constructor(
    private readonly dialogRef: MatDialogRef<ConfirmDialog>,

    @Inject(MAT_DIALOG_DATA)
    public data: ConfirmDialogData
  ) {}
  cancelButtonConfig!: ButtonConfig;
  confirmButtonConfig!: ButtonConfig;

  ngOnInit(): void {
    this.cancelButtonConfig = {
      label: this.data.cancelText || 'Cancel',
      variant: 'stroked',
      color: 'primary',

      clicked: () => {
        this.cancel();
      },
    };

    this.confirmButtonConfig = {
      label: this.data.confirmText || 'Confirm',
      variant: 'flat',
      color: 'warn',

      clicked: () => {
        this.confirm();
      },
    };
  }

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
