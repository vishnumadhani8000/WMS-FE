import {
  Component,
  OnInit,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { InputField } from '../../../shared/components/input-field/input-field';
import { Button } from '../../../shared/components/button/button';
import { InputFieldConfig } from '../../../shared/components/input-field/input-field.config';
import { ButtonConfig } from '../../../shared/components/button/button.config';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { APP_CONSTANTS } from '../../../shared/constants/app.constants';
import { DriverService } from './services/driver-management.service';
import { Driver } from './models/driver-management.model';
import { DriverDialogComponent } from './driver-dialog.component/driver-dialog.component';


@Component({
  selector: 'app-driver-management',
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
    InputField,
    Button,
  ],
  templateUrl: './driver-management.html',
  styleUrl: './driver-management.scss',
})
export class DriverManagement implements OnInit {
  private readonly driverService = inject(DriverService);
  private readonly dialog = inject(MatDialog);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSizeOptions = APP_CONSTANTS.PAGE_SIZE_OPTIONS;
  readonly displayedColumns = ['index', 'name', 'phone', 'licenceNo', 'isAvailable', 'actions'];

  drivers: Driver[] = [];
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
  addButtonConfig: ButtonConfig;

  ngOnInit(): void {
    this.initializeConfigs();
    this.initializeSearch();
    this.loadDrivers();
  }

  private initializeConfigs(): void {
    this.searchConfig = {
      label: 'Search',
      type: 'text',
      placeholder: 'Search by name, phone or licence...',
      prefixIcon: 'search',
      icon: 'close',
      formControlName: 'searchControl',
      iconClick: () => this.clearSearch(),
    };

    this.addButtonConfig = {
      label: 'Add Driver',
      variant: 'flat',
      color: 'primary',
      prefixIcon: 'add',
      clicked: () => this.openAddDialog(),
    };
  }

  private initializeSearch(): void {
    this.searchForm.controls.searchControl.valueChanges
      .pipe(
        debounceTime(APP_CONSTANTS.SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.page = 0;
        this.loadDrivers();
      });
  }

  loadDrivers(): void {
    this.loading = true;

    this.driverService
      .getDrivers({
        page: this.page + 1,
        pageSize: this.pageSize,
        search: this.searchForm.controls.searchControl.value,
        sortBy: this.sortBy ?? undefined,
        ascending: this.sortAsc ?? undefined,
      })
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => {
          this.drivers = res.items;
          this.totalCount = res.totalCount;
        },
      });
  }

  onSortChange(sort: Sort): void {
    if (!sort.direction) {
      this.sortBy = null;
      this.sortAsc = null;
    } else {
      this.sortBy = sort.active;
      this.sortAsc = sort.direction === 'asc';
    }

    this.page = 0;
    this.loadDrivers();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadDrivers();
  }

  rowIndex(index: number): number {
    return this.page * this.pageSize + index + 1;
  }

  openAddDialog(): void {
    this.dialog
      .open(DriverDialogComponent, {
        width: '520px',
        data: { mode: 'add' },
        disableClose: true,
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res?.saved) return;
        this.loadDrivers();
      });
  }

  openEditDialog(driver: Driver): void {
    this.dialog
      .open(DriverDialogComponent, {
        width: '520px',
        data: { mode: 'edit', driver },
        disableClose: true,
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res?.saved) return;
        this.loadDrivers();
      });
  }

  deleteDriver(driver: Driver): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        disableClose: true,
        data: {
          title: 'Delete Driver',
          message: `Are you sure you want to delete "${driver.name}"?`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          type: 'warning',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.driverService
          .deleteDriver(driver.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.toastr.success('Driver deleted.');
              this.loadDrivers();
            },
          });
      });
  }

  clearSearch(): void {
    this.searchForm.controls.searchControl.setValue('');
  }
}