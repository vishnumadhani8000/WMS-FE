import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ToastrService } from 'ngx-toastr';
import { Order, OrderItem, ORDER_STATUS_META, OrderStatusMeta } from './models/order.model';
import { OrderService } from './services/order.services';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  templateUrl: './my-order.html',
  styleUrl: './my-order.scss',
  imports: [CommonModule, MatIconModule, MatProgressBarModule],
})
export class MyOrders implements OnInit {
  constructor(
    private readonly orderService: OrderService,
    private readonly toastr: ToastrService,
    private readonly destroyRef: DestroyRef
  ) {}

  orders  = signal<Order[]>([]);
  loading = signal(false);

  totalOrders = computed(() => this.orders().length);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService
      .getOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.orders.set(res.data ?? []);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.toastr.error(err?.error?.message || 'Failed to load orders.');
        },
      });
  }

  getStatusMeta(status: string): OrderStatusMeta {
    return ORDER_STATUS_META[status] ?? { label: status, cssClass: 'status--pending', icon: 'help_outline' };
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  getTotalProducts(item: OrderItem): number {
    return item.price * item.quantity;
  }

  formatAddress(order: Order): string {
    const a = order.address;
    if (!a) return '—';
    return [a.addressLine, a.landmark, a.cityName, a.stateName, a.pincode]
    .filter(x => x)
      .join(', ');
  }
}