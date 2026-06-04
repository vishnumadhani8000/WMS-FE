import {
  Component,
  OnInit,
  inject,
  DestroyRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { InputField } from '../../../shared/components/input-field/input-field';
import { InputFieldConfig } from '../../../shared/components/input-field/input-field.config';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { APP_CONSTANTS } from '../../../shared/constants/app.constants';
import { OrderService } from './services/order-management.service';
import { Order, OrderStatus } from './models/order-management.model';
import { Router } from '@angular/router';

type OrderView = 'all' | 'pending';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressBarModule,
    MatButtonToggleModule,
    MatTooltipModule,
    InputField,
  ],
  templateUrl: './order-management.html',
  styleUrl: './order-management.scss',
})
export class OrderManagement implements OnInit {

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  readonly pageSizeOptions = APP_CONSTANTS.PAGE_SIZE_OPTIONS;

  readonly displayedColumns = [
    'index',
    'orderId',
    'customerName',
    'totalWeightKg',
    'cityName',
    'stateName',
    'totalItems',
    'totalPrice',
    'orderStatus',
    'createdAt',
    'actions',
  ];

  orders: Order[] = [];
  totalCount = 0;

  page = 0;
  pageSize: number = APP_CONSTANTS.DEFAULT_PAGE_SIZE;

  sortBy: string | null = 'createdAt';
  sortAsc: boolean | null = false;

  activeView: OrderView = 'all';

  searchForm = new FormGroup({
    searchControl: new FormControl('', { nonNullable: true }),
  });

  searchConfig: InputFieldConfig;

  constructor(
    private readonly orderService: OrderService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
    private readonly destroyRef: DestroyRef,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.initializeSearchConfig();
    this.initializeSearch();
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService
      .getOrders({
        page: this.page + 1,
        pageSize: this.pageSize,
        search: this.searchForm.controls.searchControl.value || undefined,
        sortBy: this.sortBy ?? undefined,
        ascending: this.sortAsc ?? undefined,
        onlyPending: this.activeView === 'pending' ? true : undefined,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => {
          this.orders = res.items;
          this.totalCount = res.totalCount;
        },
      });
  }

  onViewChange(view: OrderView): void {
    this.activeView = view;
    this.paginator?.firstPage();
    this.loadOrders();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.direction ? sort.active : null;
    this.sortAsc = sort.direction ? sort.direction === 'asc' : null;
    this.page = 0;
    this.loadOrders();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  rowIndex(index: number): number {
    return this.page * this.pageSize + index + 1;
  }

  clearSearch(): void {
    this.searchForm.controls.searchControl.setValue('');
  }

  viewOrder(order: Order): void {
    this.router.navigate([
      '/admin/order-management/order-details',
      order.orderId,
    ]);
  }

  isPending(order: Order): boolean {
    return order.status === 'Pending';
  }

  isAccepted(order: Order): boolean {
    return order.status === 'Accepted';
  }

  isDispatched(order: Order): boolean {
    return order.status === 'Dispatched';
  }

  isInTransit(order: Order): boolean {
    return order.status === 'InTransit';
  }

  isDelivered(order: Order): boolean {
    return order.status === 'Delivered';
  }

  isCancelled(order: Order): boolean {
    return order.status === 'Cancelled';
  }

  isActionable(order: Order): boolean {
    return !this.isDelivered(order) && !this.isCancelled(order);
  }

  acceptOrder(order: Order): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        disableClose: true,
        data: {
          title: 'Accept Order',
          message: `Accept order #${order.orderId} from ${order.customerName}?`,
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

        this.orderService
          .acceptOrder(order.orderId)
          .pipe(
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe({
            next: () => {
              this.toastr.success('Order accepted.');
              this.loadOrders();
            },
          });
      });
  }

  completeOrder(order: Order): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        disableClose: true,
        data: {
          title: 'Complete Order',
          message: `Mark order #${order.orderId} as completed?`,
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

        this.orderService
          .completeOrder(order.orderId)
          .pipe(
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe({
            next: () => {
              this.toastr.success('Order completed.');
              this.loadOrders();
            },
          });
      });
  }

  cancelOrder(order: Order): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        disableClose: true,
        data: {
          title: 'Cancel Order',
          message: `Are you sure you want to cancel order #${order.orderId}?`,
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

        this.orderService
          .cancelOrder(order.orderId)
          .pipe(
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe({
            next: () => {
              this.toastr.success('Order cancelled.');
              this.loadOrders();
            },
          });
      });
  }

  initializeSearchConfig(): void {
    this.searchConfig = {
      label: 'Search',
      type: 'text',
      placeholder: 'Search by Name Or Id...',
      prefixIcon: 'search',
      icon: 'close',
      formControlName: 'searchControl',
      iconClick: () => this.clearSearch(),
    };
  }

  initializeSearch(): void {
    this.searchForm.controls.searchControl.valueChanges
      .pipe(
        debounceTime(APP_CONSTANTS.SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.page = 0;
        this.loadOrders();
      });
  }
}