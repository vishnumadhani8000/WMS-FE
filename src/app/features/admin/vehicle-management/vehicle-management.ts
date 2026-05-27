import { Component, DestroyRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule, Sort } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import { VehicleService } from './services/vehicle.service';
import { Vehicle, VehicleFilter } from './models/vehicle.model';
import { VehicleDialogComponent } from './components/vehicle-dialog-component/vehicle-dialog-component';
import { InputField } from '../../../shared/components/input-field/input-field';
import { Button } from '../../../shared/components/button/button';
import { TruncatePipe } from '../../../shared/pipes/truncate-pipe';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { InputFieldConfig } from '../../../shared/components/input-field/input-field.config';
import { ButtonConfig } from '../../../shared/components/button/button.config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private readonly vehicleService = inject(VehicleService);
  private readonly dialog = inject(MatDialog);
  private readonly toastr = inject(ToastrService);
  private readonly destroyref = inject(DestroyRef);

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  readonly DEBOUNCE_MS = 500;

  readonly displayedColumns = [
    'index',
    'name',
    'plateNumber',
    'capacityKg',
    'isAvailable',
    'actions',
  ];

  readonly pageSizeOptions =APP_CONSTANTS.PAGE_SIZE_OPTIONS;

  dataSource = signal<Vehicle[]>([]);
  totalCount = signal(0);
  loading = signal(false);

  searchControl = new FormControl<string>('');

  searchInputConfig: InputFieldConfig;
  addVehicleButtonConfig: ButtonConfig;

  readonly filter = new BehaviorSubject<VehicleFilter>({
    page: 1,
    pageSize: APP_CONSTANTS.DEFAULT_PAGE_SIZE,
    search: '',
    sortBy: 'createdAt',
    ascending: false,
  });

  ngOnInit(): void {
   
    this.searchInputConfig = {
      label: 'Search',
      type: 'text',
      placeholder: 'Search vehicles...',
      prefixIcon: 'search',
      icon: 'close',
      subscriptSizing: 'dynamic',
      trimStart: true,

      control: this.searchControl,

      iconClick: () => {
        this.clearSearch();
      },
    };

    this.addVehicleButtonConfig = {
      label: 'Add Vehicle',
      variant: 'flat',
      color: 'primary',
      prefixIcon: 'add',

      clicked: () => {
        this.openAddDialog();
      },
    };

    this.initializeSearch();
    this.initializeVehicleLoader();
  }

  private initializeSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(this.DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyref)
      )
      .subscribe((search) => {
        this.paginator?.firstPage();

        this.filter.next({
          page: 1,
          pageSize: this.filter.value.pageSize,
          search,
          sortBy: this.filter.value.sortBy,
          ascending: this.filter.value.ascending,
        });
      });
  }

  private initializeVehicleLoader(): void {
    this.filter
      .pipe(
        switchMap((filter) => {
          this.loading.set(true);
  
          return this.vehicleService.getVehicles(filter).pipe(
            finalize(() => this.loading.set(false))
          );
        }),
        takeUntilDestroyed(this.destroyref)
      )
      .subscribe({
        next: (result) => {
          this.dataSource.set(result.items);
          this.totalCount.set(result.totalCount);
        }
      });
  }
  onPageChange(event: PageEvent): void {
    this.filter.next({
      page: event.pageIndex + 1,
      pageSize: event.pageSize,
      search: this.searchControl.value,
      sortBy: this.filter.value.sortBy,
      ascending: this.filter.value.ascending,
    });
  }

  onSortChange(sort: Sort): void {
    this.paginator?.firstPage();

    this.filter.next({
      page: 1,
      pageSize: this.filter.value.pageSize,
      search: this.searchControl.value,
      sortBy: sort.direction ? sort.active : undefined,
      ascending: sort.direction === '' ? undefined : sort.direction === 'asc',
    });
  }

  rowIndex(index: number): number {
    return (this.filter.value.page - 1) * this.filter.value.pageSize + index + 1;
  }

  clearSearch(): void {
    this.searchControl.setValue('');
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
        if (!result.saved) {
          return;
        }
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

        this.vehicleService.deleteVehicle(vehicle.id).subscribe({
          next: () => {
            this.toastr.warning('Vehicle deleted.');

            const isLastItemOnPage = this.dataSource().length === 1 && this.filter.value.page > 1;

            if (isLastItemOnPage) {
              this.paginator.previousPage();
            } else {
              this.reload();
            }
          },
        });
      });
  }

  private reload(): void {
    this.filter.next({
      page: this.filter.value.page,
      pageSize: this.filter.value.pageSize,
      search: this.searchControl.value,
      sortBy: this.filter.value.sortBy,
      ascending: this.filter.value.ascending,
    });
  }
}
