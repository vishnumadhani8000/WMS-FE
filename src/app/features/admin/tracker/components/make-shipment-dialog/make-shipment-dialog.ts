import { Component, Inject, OnInit, Signal, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Button } from '../../../../../shared/components/button/button';
import { ButtonConfig } from '../../../../../shared/components/button/button.config';
import {
  AvailableDriverDto,
  AvailableVehicleDto,
  MakeShipmentDialogData,
  MakeShipmentDialogResult,
} from '../../models/tracker.model';
import { FormDialog } from "../../../../../shared/components/form-dialog/form-dialog";

@Component({
  selector: 'app-make-shipment-dialog',
  standalone: true,
  templateUrl: './make-shipment-dialog.html',
  styleUrl: './make-shipment-dialog.scss',
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    Button,
    FormDialog
],
})
export class MakeShipmentDialog implements OnInit {
  selectedDriverId = signal<number | null>(null);
  selectedVehicleId = signal<number | null>(null);

  disabledConfirmButton = computed(
    () => this.selectedDriverId() === null || this.selectedVehicleId() === null
  );

  confirmButtonConfig: Signal<ButtonConfig>;
  cancelButtonConfig: ButtonConfig;
  closeButtonConfig: ButtonConfig;

  constructor(
    private readonly dialogRef: MatDialogRef<MakeShipmentDialog, MakeShipmentDialogResult>,
    @Inject(MAT_DIALOG_DATA)
    public data: MakeShipmentDialogData
  ) {}

  ngOnInit(): void {
    this.initializeButtonConfigs();
  }

  selectDriver(driver: AvailableDriverDto): void {
    this.selectedDriverId.set(this.selectedDriverId() === driver.id ? null : driver.id);
  }

  selectVehicle(vehicle: AvailableVehicleDto): void {
    this.selectedVehicleId.set(this.selectedVehicleId() === vehicle.id ? null : vehicle.id);
  }

  confirm(): void {
    if (this.selectedDriverId() === null || this.selectedVehicleId() === null) {
      return;
    }

    this.dialogRef.close({
      confirmed: true,
      driverId: this.selectedDriverId(),
      vehicleId: this.selectedVehicleId(),
    });
  }

  cancel(): void {
    this.dialogRef.close({
      confirmed: false,
    });
  }

  initializeButtonConfigs(): void {
    this.confirmButtonConfig = computed<ButtonConfig>(() => ({
      label: 'Confirm Shipment',
      variant: 'flat',
      color: 'primary',
      prefixIcon: 'local_shipping',
      disabled: this.selectedDriverId() === null || this.selectedVehicleId() === null,
      clicked: () => this.confirm(),
    }));

    this.cancelButtonConfig = {
      label: 'Cancel',
      variant: 'stroked',
      color: 'default',
      clicked: () => this.cancel(),
    };

    this.closeButtonConfig = {
      ariaLabel: 'Close',
      prefixIcon: 'close',
      variant: 'stroked',
      clicked: () => this.cancel(),
    };
  }
}
