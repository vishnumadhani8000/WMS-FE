import { Component, DestroyRef, Inject, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ButtonConfig } from '../../../shared/components/button/button.config';
import { Button } from '../../../shared/components/button/button';
import {
  ConfirmOrderDialogData,
  ConfirmOrderDialogResult,
  OrderItem,
} from './models/confirmOrder.model';
import { ConfirmOrderService } from './services/ConfirmOrderService';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-confirm-order-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatDividerModule, MatIconModule, Button],
  templateUrl: './confirm-order-dialog.html',
  styleUrl: './confirm-order-dialog.scss',
})
export class ConfirmOrderDialog implements OnInit {
  private confirmOrderService = inject(ConfirmOrderService);
  private dialogRef = inject(MatDialogRef<ConfirmOrderDialog>);
  private readonly destroyRef = inject(DestroyRef);

  cancelButtonConfig: ButtonConfig;
  placeOrderButtonConfig: ButtonConfig;

  get items(): OrderItem[] {
    return this.data.items;
  }

  get totalItems(): number {
    return this.data.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  get totalPrice(): number {
    return this.data.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  }

  get fullAddress(): string {
    const { addressLine, landmark, city, state, pincode } = this.data.deliveryAddress;
    return [addressLine, landmark, city, `${state} - ${pincode}`].filter(Boolean).join(', ');
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmOrderDialogData) {}

  ngOnInit(): void {
    this.initConfigs();
  }

  private initConfigs(): void {
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

  placeOrder(): void {
    this.confirmOrderService
      .placeOrder({
        cartId: this.data.cartId,
        addressId: this.data.addressId,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dialogRef.close({
            confirmed: true,
            response: res,
          });
        },
      });

  }
  cancel(): void {
    this.dialogRef.close({ confirmed: false } as ConfirmOrderDialogResult);
  }

}
