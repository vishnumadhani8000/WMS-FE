
import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { OrderDetailService } from '../../services/order-detail.service';
import { OrderDetail } from '../../models/order-detail.model';
import { OrderService } from '../../services/order-management.service';

import { ConfirmDialog } from '../../../../../shared/components/confirm-dialog/confirm-dialog';

import { Button } from '../../../../../shared/components/button/button';
import { ButtonConfig } from '../../../../../shared/components/button/button.config';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatTableModule,
    MatTooltipModule,
    Button,
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
})
export class OrderDetailComponent implements OnInit {

  readonly itemColumns: string[] = [
    'index',
    'productName',
    'quantity',
    'weightKg',
    'price',
    'subtotal',
  ];

  order: OrderDetail | null = null;

  loading: boolean = false;
  actionLoading: boolean = false;

  backButtonConfig: ButtonConfig;
  acceptButtonConfig: ButtonConfig;
  completeButtonConfig: ButtonConfig;
  cancelButtonConfig: ButtonConfig;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly detailService: OrderDetailService,
    private readonly orderService: OrderService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.initializeButtons();
    this.loadOrder(Number(this.route.snapshot.paramMap.get('id')));
  }

  loadOrder(id: number): void {
    this.loading = true;

    this.detailService
      .getOrderDetail(id)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (data) => {
          this.order = data;
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/admin/order-management']);
  }

  isPending(): boolean {
    return this.order.status === 'Pending';
  }

  isAccepted(): boolean {
    return this.order.status === 'Accepted';
  }

  isDispatched(): boolean {
    return this.order.status === 'Dispatched';
  }

  isInTransit(): boolean {
    return this.order.status === 'InTransit';
  }

  isDelivered(): boolean {
    return this.order?.status === 'Delivered';
  }

  isCancelled(): boolean {
    return this.order?.status === 'Cancelled';
  }

  isActionable(): boolean {
    return !this.isDelivered() && !this.isCancelled();
  }

  itemSubtotal(item: { quantity: number; price: number }): number {
    return item.quantity * item.price;
  }

  itemIndex(i: number): number {
    return i + 1;
  }

  acceptOrder(): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        disableClose: true,
        data: {
          title: 'Accept Order',
          message: `Accept order #${this.order!.orderId}?`,
          confirmText: 'Accept',
          cancelText: 'Cancel',
          type: 'info',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.actionLoading = true;

        this.orderService
          .acceptOrder(this.order!.orderId)
          .pipe(
            finalize(() => {
              this.actionLoading = false;
              this.initializeButtons();
            }),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe({
            next: () => {
              this.toastr.success('Order accepted.');
              this.loadOrder(this.order!.orderId);
            },
          });
      });
  }

  completeOrder(): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        disableClose: true,
        data: {
          title: 'Complete Order',
          message: `Mark order #${this.order!.orderId} as completed?`,
          confirmText: 'Complete',
          cancelText: 'Cancel',
          type: 'info',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.actionLoading = true;

        this.orderService
          .completeOrder(this.order!.orderId)
          .pipe(
            finalize(() => {
              this.actionLoading = false;
              this.initializeButtons();
            }),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe({
            next: () => {
              this.toastr.success('Order completed.');
              this.loadOrder(this.order!.orderId);
            },
          });
      });
  }

  cancelOrder(): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        disableClose: true,
        data: {
          title: 'Cancel Order',
          message: `Cancel order #${this.order!.orderId}?`,
          confirmText: 'Cancel Order',
          cancelText: 'Go Back',
          type: 'warning',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.actionLoading = true;

        this.orderService
          .cancelOrder(this.order!.orderId)
          .pipe(
            finalize(() => {
              this.actionLoading = false;
              this.initializeButtons();
            }),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe({
            next: () => {
              this.toastr.success('Order cancelled.');
              this.loadOrder(this.order!.orderId);
            },
          });
      });
  }

  initializeButtons(): void {
    this.backButtonConfig = {
      prefixIcon: 'arrow_back',
      variant: 'icon',
      ariaLabel: 'Back',
      clicked: () => this.goBack(),
    };

    this.acceptButtonConfig = {
      label: 'Accept Order',
      prefixIcon: 'check_circle_outline',
      variant: 'stroked',
      color: 'primary',
      loading: this.actionLoading,
      disabled: this.actionLoading,
      clicked: () => this.acceptOrder(),
    };

    this.completeButtonConfig = {
      label: 'Complete',
      prefixIcon: 'task_alt',
      variant: 'flat',
      color: 'primary',
      loading: this.actionLoading,
      disabled: this.actionLoading,
      clicked: () => this.completeOrder(),
    };

    this.cancelButtonConfig = {
      label: 'Cancel Order',
      prefixIcon: 'cancel',
      variant: 'stroked',
      color: 'warn',
      loading: this.actionLoading,
      disabled: this.actionLoading,
      clicked: () => this.cancelOrder(),
    };
  }
}