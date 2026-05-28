import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ButtonConfig } from '../../../shared/components/button/button.config';
import { Button } from '../../../shared/components/button/button';
import {
  SelectAddressDialogData,
  SelectAddressDialogResult,
} from './models/SelectAddressDialogData.model';
import { AddressData } from './models/addresh.model';

@Component({
  selector: 'app-select-address-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatDividerModule, MatIconModule, Button],
  templateUrl: './select-address-dialog.html',
  styleUrl: './select-address-dialog.scss',
})
export class SelectAddressDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<SelectAddressDialog>);

  selectedAddressId: number | null = null;
  addresses: AddressData[] = [];

  cancelButtonConfig: ButtonConfig;
  continueButtonConfig: ButtonConfig;
  closeButtonConfig: ButtonConfig;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: SelectAddressDialogData
  ) {}

  ngOnInit(): void {
    this.addresses = [...(this.data.addresses ?? [])];

    this.selectedAddressId = this.data.selectedAddressId ?? this.addresses[0]?.addressId ?? null;

    this.closeButtonConfig = {
      ariaLabel: 'Close',
      prefixIcon: 'close',
      variant: 'stroked',
      clicked: () => this.cancel(),
    };

    this.cancelButtonConfig = {
      label: 'Cancel',
      variant: 'stroked',
      color: 'default',
      clicked: () => this.cancel(),
    };

    this.continueButtonConfig = {
      label: 'Continue',
      variant: 'flat',
      color: 'primary',
      prefixIcon: 'arrow_forward',
      disabled: !this.selectedAddressId,
      clicked: () => this.confirm(),
    };
  }

  selectAddress(id: number): void {
    this.selectedAddressId = id;

    this.continueButtonConfig = {
      ...this.continueButtonConfig,
      disabled: false,
    };
  }

  openAddAddress(): void {
    this.dialogRef.close({
      action: 'add-new',
    } as SelectAddressDialogResult);
  }

  confirm(): void {
    const address = this.addresses.find((a) => a.addressId === this.selectedAddressId);

    if (!address) return;

    this.dialogRef.close({
      saved: true,
      address,
    } as SelectAddressDialogResult);
  }

  cancel(): void {
    this.dialogRef.close({
      saved: false,
    } as SelectAddressDialogResult);
  }
}
