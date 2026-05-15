import { Component, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';

import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

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
export class VehicleManagement implements OnInit, OnDestroy {
  private readonly vehicleService = inject(VehicleService);
  private readonly dialog = inject(MatDialog);
  private readonly toastr = inject(ToastrService);
  private readonly destroy = new Subject<void>();

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  readonly DEBOUNCE_MS = 500;

  readonly displayedColumns = [
    'index',
    'name',
    'plateNumber',
    'capacityKg',
    'isAvailable',
    'actions',
  ];

  readonly pageSizeOptions = [5, 10, 25];

  dataSource = signal<Vehicle[]>([]);
  totalCount = signal(0);
  loading = signal(false);
  pageSize = 10;
  currentPage = signal(0);
  sortBy: string | null = 'createdAt';
  ascending: boolean | null = false;
  searchControl = new FormControl<string>('', { nonNullable: true });
  private suppressPageEvent = false;

  readonly filter = new BehaviorSubject<VehicleFilter>({
    page: 1,
    pageSize: 10,
    search: '',
    sortBy: 'createdAt',
    ascending: false,
  });


  searchInputConfig : InputFieldConfig = {
    label : 'Search',
    type  : 'text',
    placeholder:"Search vehicles...",
    prefixIcon:'search',
    icon:this. searchControl.value ? 'close' : '',
    subscriptSizing:"dynamic",
    trimStart : true
  }

  ngOnInit(): void {
    this.initializeSearch();
    this.initializeVehicleLoader();
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  private initializeSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(this.DEBOUNCE_MS), distinctUntilChanged(), takeUntil(this.destroy))
      .subscribe((search) => {
        this.currentPage.set(0);
        this.paginator?.firstPage();

        this.filter.next({
          page: 1,
          pageSize: this.pageSize,
          search,
          sortBy: this.sortBy,
          ascending: this.ascending,
        });
      });
  }

  private initializeVehicleLoader(): void {
    this.filter
      .pipe(
        switchMap((filter) => {
          this.loading.set(true);
          return this.vehicleService.getVehicles(filter);
        }),
        takeUntil(this.destroy)
      )
      .subscribe({
        next: (result) => {
          this.dataSource.set(result.items);
          this.totalCount.set(result.totalCount);
          this.currentPage.set(result.pageNumber - 1);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.toastr.error('Failed to load vehicles.');
        },
      });
  }

  onPageChange(event: PageEvent): void {
    console.log('onchange')

    if (this.suppressPageEvent) {
      this.suppressPageEvent = false;
      return;
    }
    this.pageSize = event.pageSize;

    this.currentPage.set(event.pageIndex);

    this.filter.next({
      page: event.pageIndex + 1,
      pageSize: event.pageSize,
      search: this.searchControl.value,
      sortBy: this.sortBy,
      ascending: this.ascending,
    });
  }

  onSortChange(sort: Sort): void {
    if (!sort.direction) {
      this.sortBy = null;
      this.ascending = null;
    } else {
      this.sortBy = sort.active;
      this.ascending = sort.direction === 'asc';
    }

    this.paginator?.firstPage();

    this.filter.next({
      page: 1,
      pageSize: this.pageSize,
      search: this.searchControl.value,
      sortBy: this.sortBy ?? undefined,
      ascending: this.ascending ?? undefined,
    });
  }

  rowIndex(index: number): number {
    return this.currentPage() * this.pageSize + index + 1;
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  openAddDialog(): void {
    this.dialog
      .open(VehicleDialogComponent, {
        data: { mode: 'add' },
        panelClass: 'vehicle-dialog-panel',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result?.saved) return;
        this.toastr.success('Vehicle added successfully.');
        this.reload();
      });
  }

    openEditDialog(vehicle: Vehicle): void {
      this.dialog
        .open(VehicleDialogComponent, {
          data: { mode: 'edit', vehicle },
          panelClass: 'vehicle-dialog-panel',
          disableClose: true,
        })
        .afterClosed()
        .subscribe((result) => {
          if (!result?.saved) return;
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
        if (!confirmed) return;

        this.vehicleService
          .deleteVehicle(vehicle.id)
          .pipe()
          .subscribe({
            next: () => {
              this.toastr.warning('Product deleted.');
              const isLastItemOnPage = this.dataSource().length === 1 && this.currentPage() > 0;
              if (isLastItemOnPage) {
                this.currentPage.update((v) => v - 1);
                this.paginator?.previousPage();
              }
              else{
                this.reload();
              }
            },
          });
      });
  }

  private reload(): void {
    console.log('Reloading vehicles ')
    this.filter.next({
      page: this.currentPage() + 1,
      pageSize: this.pageSize,
      search: this.searchControl.value,
      sortBy: this.sortBy,
      ascending: this.ascending,
    });
  }
}
