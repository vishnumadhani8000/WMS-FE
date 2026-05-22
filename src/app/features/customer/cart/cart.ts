import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ButtonConfig } from '../../../shared/components/button/button.config';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { CartItem } from './models/cart.model';
import { CartService } from './Services/cart.service';
import { Button } from '../../../shared/components/button/button';

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
    Button
 
  ],
})
export class Cart implements OnInit {
  constructor(
    private readonly cartService: CartService,
    private readonly toastr: ToastrService,
    private readonly dialog: MatDialog,
    private readonly destroyRef: DestroyRef
  ) {}

  readonly displayedColumns = [
    'index',
    'name',
    'description',
    'weight',
    'quantity',
    'actions',
  ];

  cartItems = signal<CartItem[]>([]);
  totalWeightKg = signal(0);
  loading = signal(false);
  placingOrder = signal(false);

  totalItems = computed(() =>
    this.cartItems().reduce((sum, i) => sum + i.quantity, 0)
  );
  totalAmount = computed(() =>
    this.cartItems().reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    )
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
      disabled:
        this.loading() || item.quantity >= item.availableStock,
      clicked: () => this.increment(item),
    });
  
    this.decrementButtonConfig = (item: CartItem): ButtonConfig => ({
      variant: 'icon',
      color: 'default',
      prefixIcon: 'remove',
      disabled: this.loading(),
      clicked: () => this.decrement(item),
    });
  }

  // ── Data ────────────────────────
  loadCart(): void {
    this.loading.set(true);

    this.cartService
      .getCart()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (!res.isSuccess ) {
            this.loading.set(false);
            this.toastr.error('Failed to load cart.');
            return;
          }
          if(res.isSuccess && !res.data){
            this.loading.set(false);
            return;
          }

          this.cartItems.set(res.data.items ?? []);
          this.totalWeightKg.set(res.data.totalWeightKg ?? 0);
          this.loading.set(false);
        },

        error: () => {
          this.loading.set(false);
          this.toastr.error('Failed to load cart.');
        },
      });
  }

  // ── Quantity ─────────────────────
  increment(item: CartItem): void {
    if (item.quantity >= item.availableStock) {
      this.toastr.warning(`Only ${item.availableStock} in stock.`);
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
    this.cartService
      .updateQuantity(item.cartItemId, { quantity })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {  
            this.loadCart(); 
        },
        error: (err) => {
          this.toastr.error(
            err?.error?.message || 'Failed to update quantity.'
          );
          this.loadCart();
        }
      });
  }

  // ── Delete ─────────────────
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
          if (res.isSuccess) {
            this.cartItems.update((items) =>
              items.filter((i) => i.cartItemId !== item.cartItemId)
            );
            this.toastr.success('Item removed from cart.');
          } else {
            this.toastr.error(res.message);
          }
        },
        error: () => this.toastr.error('Failed to remove item.'),
      });
  }

  // ── Place Order ───────────────
  placeOrder(): void {
    if (this.cartItems().length === 0) {
      this.toastr.warning('Your cart is empty.');
      return;
    }

    this.placingOrder.set(true);
    this.placeOrderButtonConfig = {
      ...this.placeOrderButtonConfig,
      label: 'Placing Order...',
      disabled: true,
    };

    this.cartService
      .placeOrder()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.placingOrder.set(false);
          this.placeOrderButtonConfig = {
            ...this.placeOrderButtonConfig,
            label: 'Place Order',
            disabled: false,
          };

          if (res.isSuccess) {
            this.cartItems.set([]);
            this.totalWeightKg.set(0);
            this.toastr.success('Order placed successfully!');
          } else {
            this.toastr.error(res.message);
          }
        },

        error: () => {
          this.placingOrder.set(false);
          this.placeOrderButtonConfig = {
            ...this.placeOrderButtonConfig,
            label: 'Place Order',
            disabled: false,
          };
          this.toastr.error('Failed to place order.');
        },
      });
  }

}