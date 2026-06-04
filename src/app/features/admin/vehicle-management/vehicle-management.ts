import {
  Component,
  OnInit,
  ViewChild,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule, Sort } from '@angular/material/sort';

import { ToastrService } from 'ngx-toastr';

import { VehicleService } from './services/vehicle.service';
import { Vehicle } from './models/vehicle.model';
import { VehicleDialogComponent } from './components/vehicle-dialog-component/vehicle-dialog-component';

import { InputField } from '../../../shared/components/input-field/input-field';
import { Button } from '../../../shared/components/button/button';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

import { TruncatePipe } from '../../../shared/pipes/truncate-pipe';
import { InputFieldConfig } from '../../../shared/components/input-field/input-field.config';
import { ButtonConfig } from '../../../shared/components/button/button.config';

import { APP_CONSTANTS } from '../../../shared/constants/app.constants';

@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  templateUrl: './vehicle-management.html',
  styleUrl: './vehicle-management.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTooltipModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatMenuModule,
    MatSortModule,
    InputField,
    Button,
    TruncatePipe,
  ],
})
export class VehicleManagement implements OnInit {
  constructor(
    private readonly vehicleService: VehicleService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
    private readonly destroyRef: DestroyRef
  ) {}

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  readonly displayedColumns = [
    'index',
    'name',
    'plateNumber',
    'capacityKg',
    'isAvailable',
    'actions',
  ];

  readonly pageSizeOptions = APP_CONSTANTS.PAGE_SIZE_OPTIONS;

  dataSource: Vehicle[] = [];
  totalCount = 0;
  loading = false;

  page = 0;
  pageSize:number = APP_CONSTANTS.DEFAULT_PAGE_SIZE;

  sortBy: string | null = 'createdAt';
  sortAsc: boolean | null = false;

  form = new FormGroup({
    searchControl: new FormControl('', {
      nonNullable: true,
    }),
  });

  searchInputConfig: InputFieldConfig;
  addVehicleButtonConfig: ButtonConfig;

  ngOnInit(): void {
    this.searchInputConfig = {
      label: 'Search',
      type: 'text',
      placeholder: 'Search vehicles...',
      prefixIcon: 'search',
      icon: 'close',
      trimStart: true,
      formControlName: 'searchControl',

      iconClick: () => this.clearSearch(),
    };

    this.addVehicleButtonConfig = {
      label: 'Add Vehicle',
      variant: 'flat',
      color: 'primary',
      prefixIcon: 'add',

      clicked: () => this.openAddDialog(),
    };

    this.form.controls.searchControl.valueChanges
      .pipe(
        debounceTime(APP_CONSTANTS.SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.page = 0;
        this.loadVehicles();
      });

    this.loadVehicles();
  }

  loadVehicles(): void {
    this.loading = true;

    this.vehicleService
      .getVehicles({
        page: this.page + 1,
        pageSize: this.pageSize,
        search: this.form.controls.searchControl.value,
        sortBy: this.sortBy,
        ascending: this.sortAsc,
      })
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (result) => {
          this.dataSource = result.items;
          this.totalCount = result.totalCount;
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;

    this.loadVehicles();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.direction ? sort.active : null;

    this.sortAsc = sort.direction
      ? sort.direction === 'asc'
      : null;

    this.page = 0;
    this.loadVehicles();
  }

  rowIndex(index: number): number {
    return this.page * this.pageSize + index + 1;
  }

  clearSearch(): void {
    this.form.controls.searchControl.setValue('');
  }

  openAddDialog(): void {
    this.dialog
      .open(VehicleDialogComponent, {
        data: {
          mode: 'add',
        },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result?.saved) {
          return;
        }

        this.toastr.success('Vehicle added successfully.');
        this.reload();
      });
  }

  openEditDialog(vehicle: Vehicle): void {
    this.dialog
      .open(VehicleDialogComponent, {
        data: {
          mode: 'edit',
          vehicle,
        },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result?.saved) {
          return;
        }

        this.toastr.success('Vehicle updated successfully.');
        this.reload();
      });
  }

  deleteVehicle(vehicle: Vehicle): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        disableClose: true,
        data: {
          title: 'Delete Vehicle',
          message: `Are you sure you want to delete "${vehicle.name}"?`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          type: 'warning',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.vehicleService
          .deleteVehicle(vehicle.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.toastr.warning('Vehicle deleted.');

              const isLastItemOnPage =
                this.dataSource.length === 1 && this.page > 0;

              if (isLastItemOnPage) {
                this.paginator.previousPage();
              } else {
                this.reload();
              }
            },
          });
      });
  }

  reload(): void {
    this.loadVehicles();
  }
}