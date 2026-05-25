import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ButtonConfig } from '../../../shared/components/button/button.config';
import { Button } from '../../../shared/components/button/button';
import { SelectAddressDialogData, SelectAddressDialogResult } from './models/SelectAddressDialogData.model';
import { AddressData } from './models/addresh.model';
import { AddAddressDialogComponent } from './components/add-address-dialog-component/add-address-dialog-component';
import { AddAddressDialogResult } from './models/addAddressDialogData.model';
@Component({
  selector: 'app-select-address-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    Button,
  ],
  templateUrl: './address.html',
  styleUrl: './address.scss',
})
export class Address implements OnInit {
  private dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<Address>);

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
    this.selectedAddressId =
      this.data.selectedAddressId ?? (this.addresses[0]?.addressId ?? null);

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
    const addRef = this.dialog.open(AddAddressDialogComponent, {
      data: { existingCount: this.addresses.length },
      panelClass: 'custom-dialog-panel',
      disableClose: true,
    });

    addRef.afterClosed().subscribe((result: AddAddressDialogResult) => {
      if (result?.saved && result.address) {
        this.addresses = [...this.addresses, result.address];
        this.selectAddress(result.address.addressId);
      }
    });
  }

  confirm(): void {
    const address = this.addresses.find((a) => a.addressId === this.selectedAddressId);
    this.dialogRef.close({ saved: true, address } as SelectAddressDialogResult);
  }

  cancel(): void {
    this.dialogRef.close({ saved: false } as SelectAddressDialogResult);
  }
}