import {
  Component,
  OnInit,
  signal,
  computed,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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

  orders = signal<Order[]>([]);
  totalOrders = computed(() => this.orders().length);

  constructor(
    private readonly orderService: OrderService,
    private readonly destroyRef: DestroyRef
  ) { }

  ngOnInit(): void {
    this.loadOrders();
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

  private loadOrders(): void {
    this.orderService
      .getOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.orders.set(res.data ?? []);
        },
      });
  }
}