import {
  Component,
  Inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatIconModule } from '@angular/material/icon';

import { ConfirmDialogData } from './confirm-dialog.model';

import { Button } from '../button/button';

@Component({
  selector: 'app-confirm-dialog',

  standalone: true,

  templateUrl: './confirm-dialog.html',

  styleUrl: './confirm-dialog.scss',

  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    Button,
  ],
})
export class ConfirmDialog {

  constructor(

    private readonly dialogRef:
      MatDialogRef<ConfirmDialog>,

    @Inject(MAT_DIALOG_DATA)
    public data: ConfirmDialogData
  ) {}

  confirm(): void {

    this.dialogRef.close(true);
  }

  cancel(): void {

    this.dialogRef.close(false);
  }
}