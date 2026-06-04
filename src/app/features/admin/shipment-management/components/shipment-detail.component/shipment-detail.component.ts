import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { ShipmentService } from '../../services/shipment.service';
import { ShipmentDetail } from '../../models/shipment.model';
import { ConfirmDialog } from '../../../../../shared/components/confirm-dialog/confirm-dialog';
import { Button } from '../../../../../shared/components/button/button';
import { ButtonConfig } from '../../../../../shared/components/button/button.config';
import { ShipmentDetailService } from '../../services/shipment-details.service';

@Component({
  selector: 'app-shipment-detail',
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
  templateUrl: './shipment-detail.component.html',
  styleUrl: './shipment-detail.component.scss',
})
export class ShipmentDetailComponent implements OnInit {

  readonly orderColumns = [
    'index',
    'orderId',
    'customerName',
    'cityName',
    'stateName',
    'totalWeightKg',
    'totalPrice',
  ];

  shipment: ShipmentDetail | null = null;

  backButtonConfig: ButtonConfig;
  transitButtonConfig: ButtonConfig;
  deliveredButtonConfig: ButtonConfig;
  cancelButtonConfig: ButtonConfig;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly detailService: ShipmentDetailService,
    private readonly shipmentService: ShipmentService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.initializeButtons();
    this.loadShipment(
      Number(this.route.snapshot.paramMap.get('id'))
    );
  }

  loadShipment(id: number): void {
    this.detailService
      .getShipmentDetail(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (data) => {
          this.shipment = data;
        },
      });
  }

  goBack(): void {
    this.router.navigate([
      '/admin/shipment-management',
    ]);
  }

  orderIndex(i: number): number {
    return i + 1;
  }

  isAssigned(): boolean {
    return this.shipment?.status === 'Assigned';
  }

  isInTransit(): boolean {
    return this.shipment?.status === 'InTransit';
  }

  isDelivered(): boolean {
    return this.shipment?.status === 'Delivered';
  }

  isCancelled(): boolean {
    return this.shipment?.status === 'Cancelled';
  }

  isActionable(): boolean {
    return !this.isDelivered() &&
      !this.isCancelled();
  }

  markInTransit(): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        disableClose: true,
        data: {
          title: 'Mark In Transit',
          message: `Mark shipment #${this.shipment!.shipmentId} as In Transit?`,
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          type: 'info',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.shipmentService
          .updateShipmentStatus(
            this.shipment!.shipmentId,
            'InTransit'
          )
          .pipe(
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe({
            next: () => {
              this.toastr.success(
                'Shipment is now In Transit.'
              );

              this.loadShipment(
                this.shipment!.shipmentId
              );
            },
          });
      });
  }

  markDelivered(): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        disableClose: true,
        data: {
          title: 'Mark Delivered',
          message: `Mark shipment #${this.shipment!.shipmentId} as Delivered?`,
          confirmText: 'Delivered',
          cancelText: 'Cancel',
          type: 'info',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.shipmentService
          .updateShipmentStatus(
            this.shipment!.shipmentId,
            'Delivered'
          )
          .pipe(
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe({
            next: () => {
              this.toastr.success(
                'Shipment marked as Delivered.'
              );

              this.loadShipment(
                this.shipment!.shipmentId
              );
            },
          });
      });
  }

  cancelShipment(): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        disableClose: true,
        data: {
          title: 'Cancel Shipment',
          message: `Cancel shipment #${this.shipment!.shipmentId}?`,
          confirmText: 'Cancel Shipment',
          cancelText: 'Go Back',
          type: 'warning',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.shipmentService
          .updateShipmentStatus(
            this.shipment!.shipmentId,
            'Cancelled'
          )
          .pipe(
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe({
            next: () => {
              this.toastr.success(
                'Shipment cancelled.'
              );

              this.loadShipment(
                this.shipment!.shipmentId
              );
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

    this.transitButtonConfig = {
      label: 'Mark In Transit',
      prefixIcon: 'local_shipping',
      variant: 'stroked',
      color: 'primary',
      clicked: () => this.markInTransit(),
    };

    this.deliveredButtonConfig = {
      label: 'Mark Delivered',
      prefixIcon: 'task_alt',
      variant: 'flat',
      color: 'primary',
      clicked: () => this.markDelivered(),
    };

    this.cancelButtonConfig = {
      label: 'Cancel Shipment',
      prefixIcon: 'cancel',
      variant: 'stroked',
      color: 'warn',
      clicked: () => this.cancelShipment(),
    };
  }
}