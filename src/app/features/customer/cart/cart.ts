import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Button } from '../../../shared/components/button/button';
import { ButtonConfig } from '../../../shared/components/button/button.config';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { CartItem, CheckoutAddress, CheckoutOrderItem } from './models/cart.model';
import { CartService } from './Services/cart.service';
import { SelectAddressDialog } from '../address/select-address-dialog';
import { AddAddressDialogComponent } from '../address/components/add-address-dialog-component/add-address-dialog-component';
import { ConfirmOrderDialog } from '../confirm-order-dialog/confirm-order-dialog';
import {
  ConfirmOrderDialogData,
  ConfirmOrderDialogResult,
} from '../confirm-order-dialog/models/confirmOrder.model';
import { SelectAddressDialogResult } from '../address/models/SelectAddressDialogData.model';
@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatRippleModule,
    Button,
  ],
})
export class Cart implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly toastr = inject(ToastrService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly displayedColumns = ['index', 'name', 'description', 'weight', 'quantity', 'actions'];

  cartItems = signal<CartItem[]>([]);
  totalWeightKg = signal(0);
  loading = signal(false);
  quantityLoading = signal(false);
  cartId = signal(0);
  totalItems = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));

  totalAmount = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  placeOrderButtonConfig: ButtonConfig;

  deleteButtonConfig: (item: CartItem) => ButtonConfig;
  incrementButtonConfig: (item: CartItem) => ButtonConfig;
  decrementButtonConfig: (item: CartItem) => ButtonConfig;

  ngOnInit(): void {
    this.initializeConfigs();
    this.loadCart();
  }

  private initializeConfigs(): void {
    this.placeOrderButtonConfig = {
      label: 'Place Order',
      variant: 'flat',
      color: 'primary',
      prefixIcon: 'shopping_bag',
      clicked: () => this.placeOrder(),
    };

    this.deleteButtonConfig = (item: CartItem): ButtonConfig => ({
      variant: 'icon',
      color: 'warn',
      prefixIcon: 'delete_outline',
      clicked: () => this.confirmDelete(item),
    });

    this.incrementButtonConfig = (item: CartItem): ButtonConfig => ({
      variant: 'icon',
      color: 'primary',
      prefixIcon: 'add',
      disabled: this.quantityLoading() || item.quantity >= item.availableStock,
      clicked: () => this.increment(item),
    });

    this.decrementButtonConfig = (item: CartItem): ButtonConfig => ({
      variant: 'icon',
      color: 'default',
      prefixIcon: 'remove',
      disabled: this.quantityLoading(),
      clicked: () => this.decrement(item),
    });
  }

  loadCart(): void {
    this.loading.set(true);

    this.cartService
      .getCart()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (!res.data) {
            this.loading.set(false);
            return;
          }

          this.cartId.set(res.data.cartId);
          this.cartItems.set(res.data.items ?? []);
          this.totalWeightKg.set(res.data.totalWeightKg ?? 0);

        },
      });
      this.loading.set(false);
  }

  increment(item: CartItem): void {
    if (item.quantity >= item.availableStock) {
      this.toastr.warning(`Only ${item.availableStock} items available in stock.`);
      return;
    }

    this.updateQuantity(item, item.quantity + 1);
  }

  decrement(item: CartItem): void {
    if (item.quantity <= 1) {
      this.confirmDelete(item);
      return;
    }
    this.updateQuantity(item, item.quantity - 1);
  }

  private updateQuantity(item: CartItem, quantity: number): void {
    this.quantityLoading.set(true);
  
    this.cartService
      .updateQuantity(item.cartItemId, { quantity })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadCart();
        },
  
        complete: () => {
          this.quantityLoading.set(false);
        }
      });
  }

  confirmDelete(item: CartItem): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        disableClose: true,
        data: {
          title: 'Remove Item',
          message: `Are you sure you want to remove "${item.productName}" from your cart?`,
          confirmText: 'Remove',
          cancelText: 'Cancel',
          type: 'warning',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.deleteItem(item);
      });
  }

  private deleteItem(item: CartItem): void {
    this.cartService
      .deleteCartItem(item.cartItemId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (!res.isSuccess) return;

          this.loadCart();
          this.toastr.success('Item removed from cart.');
        },
      });
  }

  placeOrder(): void {
    this.cartService
      .getUserAddresses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const addresses = res.data ?? [];

          const orderItems: CheckoutOrderItem[] = this.cartItems().map((item) => ({
            id: item.cartItemId,
            name: item.productName,
            quantity: item.quantity,
            unitPrice: item.price,
          }));

          if (addresses.length) {
            this.openSelectAddressDialog(addresses, orderItems);
            return;
          }

          this.openAddAddressDialog(orderItems);
        },
      });
  }

  private openSelectAddressDialog(addresses: CheckoutAddress[], orderItems: CheckoutOrderItem[]): void {
    this.dialog
      .open(SelectAddressDialog, {
        width: '800px',
        maxWidth: '95vw',
        disableClose: true,
        data: {
          addresses,
        },
      })
      .afterClosed()
      .subscribe((result: SelectAddressDialogResult) => {
        if (result?.action === 'add-new') {
          this.openAddAddressDialog(orderItems);
          return;
        } 
        if(result?.action === 'delete'){
          this.placeOrder();
          return;
        }

        if (!result?.saved || !result.address) {
          return;
        }
        console.log(result.address);
        this.openConfirmOrderDialog(result.address, orderItems);
      });
  }

  private openAddAddressDialog(orderItems: CheckoutOrderItem[]): void {
    this.dialog
      .open(AddAddressDialogComponent, {
        width: '700px',
        maxWidth: '95vw',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result.saved || !result.address) {
          this.reloadAddressesAndOpenDialog(orderItems);
          return;
        }
        console.log(result.address);
        this.openConfirmOrderDialog(result.address, orderItems);

      });
  }

  private openConfirmOrderDialog(address: CheckoutAddress, orderItems: CheckoutOrderItem[]): void {
    this.dialog
      .open(ConfirmOrderDialog, {
        width: '560px',
        maxWidth: '95vw',
        disableClose: true,
        data: {
          cartId: this.cartId(),
          addressId: address.addressId,
          items: orderItems,

          deliveryAddress: {
            addressLine: address.addressLine,
            landmark: address.landmark,
            city: address.cityName,
            state: address.stateName,
            pincode: address.pincode,
          },
        } as ConfirmOrderDialogData,
      })
      .afterClosed()
      .subscribe((result: ConfirmOrderDialogResult) => {
        if (!result.confirmed) {
          this.reloadAddressesAndOpenDialog(orderItems);
          return;
        }

        const response = result.response;

        if (!response) return;

        if (!response.isSuccess) {
          const message = response.errors?.[0] ?? response.message ?? 'Failed to place order.';
          this.toastr.error(message);
          this.loadCart();
          return;
        }

        this.cartItems.set([]);
        this.totalWeightKg.set(0);

        this.toastr.success(response.message ?? 'Order placed successfully!');
      });
  }
  private reloadAddressesAndOpenDialog(orderItems: CheckoutOrderItem[]): void {
    this.cartService
      .getUserAddresses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const addresses = res.data ?? [];
          if (!addresses.length) {
            return;
          }

          this.openSelectAddressDialog(addresses, orderItems);
        },
      });
  }
}
