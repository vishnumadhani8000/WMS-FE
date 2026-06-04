import { Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Button } from '../../../shared/components/button/button';
import { ButtonConfig } from '../../../shared/components/button/button.config';

import {
  ConfirmOrderDialogData,
  ConfirmOrderDialogResult,
  OrderItem,
} from './models/confirmOrder.model';

import { ConfirmOrderService } from './services/ConfirmOrderService';

@Component({
  selector: 'app-confirm-order-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    Button,
  ],
  templateUrl: './confirm-order-dialog.html',
  styleUrl: './confirm-order-dialog.scss',
})
export class ConfirmOrderDialog implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: ConfirmOrderDialogData,

    private readonly confirmOrderService: ConfirmOrderService,
    private readonly dialogRef: MatDialogRef<
      ConfirmOrderDialog,
      ConfirmOrderDialogResult
    >,
    private readonly destroyRef: DestroyRef
  ) { }

  cancelButtonConfig: ButtonConfig;
  placeOrderButtonConfig: ButtonConfig;

  ngOnInit(): void {
    this.initializeButtonConfigs();
  }

  get items(): OrderItem[] {
    return this.data.items;
  }

  get totalItems(): number {
    return this.data.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }

  get totalPrice(): number {
    return this.data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
  }

  get fullAddress(): string {
    const {
      addressLine,
      landmark,
      city,
      state,
      pincode,
    } = this.data.deliveryAddress;

    return [
      addressLine,
      landmark,
      city,
      `${state} - ${pincode}`,
    ]
      .filter(Boolean)
      .join(', ');
  }


  placeOrder(): void {
    this.confirmOrderService
      .placeOrder({
        cartId: this.data.cartId,
        addressId: this.data.addressId,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.dialogRef.close({
            confirmed: true,
            response,
          });
        },
      });
  }

  cancel(): void {
    this.dialogRef.close({
      confirmed: false,
    });
  }


  private initializeButtonConfigs(): void {
    this.cancelButtonConfig = {
      label: 'Cancel',
      variant: 'stroked',
      color: 'default',
      clicked: () => this.cancel(),
    };

    this.placeOrderButtonConfig = {
      label: 'Place Order',
      variant: 'flat',
      color: 'primary',
      clicked: () => this.placeOrder(),
    };
  }
}