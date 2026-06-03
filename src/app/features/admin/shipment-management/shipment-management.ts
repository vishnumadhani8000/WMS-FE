import {
  Component,
  OnInit,
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { InputField } from '../../../shared/components/input-field/input-field';
import { InputFieldConfig } from '../../../shared/components/input-field/input-field.config';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { APP_CONSTANTS } from '../../../shared/constants/app.constants';

import { ShipmentService } from './services/shipment.service';
import { Shipment } from './models/shipment.model';

@Component({
  selector: 'app-shipment-management',
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
    MatTooltipModule,
    InputField,
  ],
  templateUrl: './shipment-management.html',
  styleUrl: './shipment-management.scss',
})
export class ShipmentManagement implements OnInit {
  constructor(
    private readonly shipmentService: ShipmentService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
    private readonly destroyRef: DestroyRef,
    private readonly router: Router,
  ) {}

  readonly pageSizeOptions = APP_CONSTANTS.PAGE_SIZE_OPTIONS;
  readonly displayedColumns = [
    'index', 'shipmentId', 'driverName', 'vehicleNumber',
    'status', 'createdAt', 'actions',
  ];

  shipments: Shipment[] = [];
  totalCount = 0;
  loading = false;
  page = 0;
  pageSize: number = APP_CONSTANTS.DEFAULT_PAGE_SIZE;
  sortBy: string | null = 'createdAt';
  sortAsc: boolean | null = false;

  searchForm = new FormGroup({
    searchControl: new FormControl(''),
  });

  searchConfig: InputFieldConfig;

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  ngOnInit(): void {
    this.searchConfig = {
      label: 'Search',
      type: 'text',
      placeholder: 'Search by Driver or Vehicle...',
      prefixIcon: 'search',
      icon: 'close',
      formControlName: 'searchControl',
      iconClick: () => this.clearSearch(),
    };

    this.searchForm.controls.searchControl.valueChanges
      .pipe(
        debounceTime(APP_CONSTANTS.SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.paginator?.firstPage();
        this.loadShipments();
      });

    this.loadShipments();
  }

  loadShipments(): void {
    this.loading = true;

    this.shipmentService
      .getShipments({
        page: this.page + 1,
        pageSize: this.pageSize,
        search: this.searchForm.controls.searchControl.value ,
        sortBy: this.sortBy,
        ascending: this.sortAsc ,
      })
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => {
          this.shipments = res.items;
          this.totalCount = res.totalCount;
        },
      });
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.direction ? sort.active : null;
    this.sortAsc = sort.direction ? sort.direction === 'asc' : null;
    this.paginator?.firstPage();  
    this.loadShipments();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadShipments();
  }

  rowIndex(index: number): number {
    return this.page * this.pageSize + index + 1;
  }

  clearSearch(): void {
    this.searchForm.controls.searchControl.setValue('');
  }

  viewShipment(shipment: Shipment): void {
    this.router.navigate(['/admin/shipment-management/shipment-details', shipment.shipmentId]);
  }

  // ── Status Helpers ────────────────────────────────

  isAssigned(shipment: Shipment): boolean {
    return shipment.status === 'Assigned';
  }

  isInTransit(shipment: Shipment): boolean {
    return shipment.status === 'InTransit';
  }

  isDelivered(shipment: Shipment): boolean {
    return shipment.status === 'Delivered';
  }

  isCancelled(shipment: Shipment): boolean {
    return shipment.status === 'Cancelled';
  }

  isActionable(shipment: Shipment): boolean {
    return !this.isDelivered(shipment) && !this.isCancelled(shipment);
  }

  // ── Actions ──────────────────────────────────────────

  markInTransit(shipment: Shipment): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        disableClose: true,
        data: {
          title: 'Mark In Transit',
          message: `Mark shipment #${shipment.shipmentId} as In Transit?`,
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          type: 'info',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.shipmentService
          .updateShipmentStatus(shipment.shipmentId , 'InTransit')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({ next: () => { this.toastr.success('Shipment marked as In Transit.'); this.loadShipments(); } });
      });
  }

  markDelivered(shipment: Shipment): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        disableClose: true,
        data: {
          title: 'Mark Delivered',
          message: `Mark shipment #${shipment.shipmentId} as Delivered?`,
          confirmText: 'Delivered',
          cancelText: 'Cancel',
          type: 'info',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.shipmentService
          .updateShipmentStatus(shipment.shipmentId , 'Delivered')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({ next: () => { this.toastr.success('Shipment marked as Delivered.'); this.loadShipments(); } });
      });
  }

  cancelShipment(shipment: Shipment): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        disableClose: true,
        data: {
          title: 'Cancel Shipment',
          message: `Are you sure you want to cancel shipment #${shipment.shipmentId}?`,
          confirmText: 'Cancel Shipment',
          cancelText: 'Go Back',
          type: 'warning',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.shipmentService
          .updateShipmentStatus(shipment.shipmentId, 'Cancelled')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({ next: () => { this.toastr.success('Shipment cancelled.'); this.loadShipments(); } });
      });
  }
}