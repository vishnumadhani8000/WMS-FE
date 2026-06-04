import { Component, OnInit, signal, computed, ViewChild, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { MakeShipmentDialog } from './components/make-shipment-dialog/make-shipment-dialog';
import { InputField } from '../../../shared/components/input-field/input-field';
import { Button } from '../../../shared/components/button/button';
import { InputFieldConfig } from '../../../shared/components/input-field/input-field.config';
import { ButtonConfig } from '../../../shared/components/button/button.config';
import { APP_CONSTANTS } from '../../../shared/constants/app.constants';

import {
  AdminOrderFilter,
  AdminOrderResponseDto,
  CityDto,
  MakeShipmentDialogData,
  MakeShipmentDialogResult,
  StateDto,
} from './models/tracker.model';
import { SelectFieldConfig } from '../../../shared/components/select-field/select-field.config';
import { SelectField } from '../../../shared/components/select-field/select-field';
import { TrackerService } from './serviceses/tracker.service';

@Component({
  selector: 'app-tracker',
  standalone: true,
  templateUrl: './tracker.html',
  styleUrl: './tracker.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSortModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    InputField,
    Button,
    SelectField,
  ],
})
export class Tracker implements OnInit {
  constructor(
    private readonly trackerService: TrackerService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
    private readonly destroyRef: DestroyRef
  ) {}

  @ViewChild(MatPaginator) paginator: MatPaginator;

  readonly displayedColumns = [
    'select',
    'index',
    'orderId',
    'totalWeightKg',
    'totalPrice',
    'stateName',
    'cityName',
    'status',
  ];
  readonly pageSizeOptions = APP_CONSTANTS.PAGE_SIZE_OPTIONS;

  selectedOrders = signal<Map<number, AdminOrderResponseDto>>(new Map());
  orders = signal<AdminOrderResponseDto[]>([]);
  totalCount = 0;
  page: number = 1;
  pageSize: number = APP_CONSTANTS.DEFAULT_PAGE_SIZE;
  sortByField: string | undefined = 'createdAt';
  isAscending: boolean | undefined = false;

  states: StateDto[] = [];
  cities: CityDto[] = [];

  stateConfig: SelectFieldConfig;
  cityConfig: SelectFieldConfig;
  searchInputConfig: InputFieldConfig;

  form = new FormGroup({
    searchControl: new FormControl('', { nonNullable: true }),
    stateControl: new FormControl<number | null>(null),
    cityControl: new FormControl<number | null>({ value: null, disabled: true }),
  });

  selectedCount = computed(() => this.selectedOrders().size);

  isAllSelected = computed(() => {
    const selected = this.selectedOrders();
    return this.orders().length > 0 && this.orders().every((order) => selected.has(order.orderId));
  });

  selectedWeight = computed(() =>
    [...this.selectedOrders().values()].reduce((sum, order) => sum + order.totalWeightKg, 0)
  );

  isIndeterminate = computed(() => {
    const selectedOnCurrentPage = this.orders().filter((order) =>
      this.selectedOrders().has(order.orderId)
    ).length;

    return selectedOnCurrentPage > 0 && selectedOnCurrentPage < this.orders().length;
  });

  makeShipmentButtonConfig = computed<ButtonConfig>(() => ({
    label: 'Make Shipment',
    variant: 'flat',
    color: 'primary',
    prefixIcon: 'local_shipping',
    disabled: this.selectedCount() === 0,
    clicked: () => this.onMakeShipment(),
  }));

  ngOnInit(): void {
    this.initConfigs();
    this.initFilterSubscriptions();
    this.loadStates();
    this.loadOrders();
  }

  private initConfigs(): void {
    this.searchInputConfig = {
      label: 'Search',
      type: 'text',
      placeholder: 'Search orders...',
      prefixIcon: 'search',
      icon: 'close',
      trimStart: true,
      formControlName: 'searchControl',
      iconClick: () => this.clearSearch(),
    };

    this.stateConfig = {
      label: 'State',
      control: this.form.controls.stateControl,
      options: [],
    };

    this.cityConfig = {
      label: 'City',
      control: this.form.controls.cityControl,
      options: [],
    };
  }

  private initFilterSubscriptions(): void {
    this.form.controls.searchControl.valueChanges
      .pipe(
        debounceTime(APP_CONSTANTS.SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.clearSelection();
        this.paginator?.firstPage();
        this.loadOrders();
      });

    this.form.controls.stateControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((stateId) => {
        this.clearSelection();
        this.form.controls.cityControl.setValue(null, {
          emitEvent: false,
        });

        this.form.controls.cityControl.disable({
          emitEvent: false,
        });

        this.cities = [];
        this.cityConfig = {
          ...this.cityConfig,
          options: [],
        };

        if (stateId) {
          this.trackerService
            .getCitiesByState(stateId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (res) => {
                this.cities = res.data ?? [];

                this.cityConfig = {
                  ...this.cityConfig,
                  options: [
                    {
                      label: 'All Cities',
                      value: null,
                    },
                    ...this.cities.map((c) => ({
                      label: c.name,
                      value: c.id,
                    })),
                  ],
                };

                this.form.controls.cityControl.enable({
                  emitEvent: false,
                });
              },
            });
        }

        this.paginator?.firstPage();
        this.loadOrders();
      });

    this.form.controls.cityControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.clearSelection();
        this.paginator?.firstPage();
        this.loadOrders();
      });
  }

  private loadStates(): void {
    this.trackerService
      .getStates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.states = res.data ?? [];

          const stateOptions = [
            { label: 'All States', value: null },
            ...this.states.map((s) => ({ label: s.name, value: s.id })),
          ];

          this.stateConfig = {
            ...this.stateConfig,
            options: stateOptions,
          };
        },
      });
  }

  loadOrders(): void {
    const filterParams: AdminOrderFilter = {
      page: this.page,
      pageSize: this.pageSize,
      search: this.form.controls.searchControl.value,
      stateId: this.form.controls.stateControl.value,
      cityId: this.form.controls.cityControl.value,
      sortBy: this.sortByField,
      ascending: this.isAscending,
      isPendingAndAccepted: true,
    };

    this.trackerService
      .getOrders(filterParams)
      .pipe(
        takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.orders.set(res.data?.items ?? []);
          this.totalCount = res.data?.totalCount ?? 0;
          
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  onSortChange(sort: Sort): void {
    this.paginator?.firstPage();
    this.sortByField = sort.direction ? sort.active : undefined;
    this.isAscending = sort.direction === '' ? undefined : sort.direction === 'asc';
    this.loadOrders();
  }

  toggleAll(): void {
    const allSelected = this.orders().every((order) => this.selectedOrders().has(order.orderId));

    this.selectedOrders.update((current) => {
      const next = new Map(current);

      if (allSelected) {
        this.orders().forEach((order) => next.delete(order.orderId));
      } else {
        this.orders().forEach((order) => next.set(order.orderId, order));
      }

      return next;
    });
  }
  toggleRow(order: AdminOrderResponseDto): void {
    this.selectedOrders.update((current) => {
      const next = new Map(current);

      if (next.has(order.orderId)) {
        next.delete(order.orderId);
      } else {
        next.set(order.orderId, order);
      }

      return next;
    });
  }

  isSelected(order: AdminOrderResponseDto): boolean {
    return this.selectedOrders().has(order.orderId);
  }

  onMakeShipment(): void {
    const selectedOrders = [...this.selectedOrders().values()];

    if (!selectedOrders.length) {
      return;
    }

    const selectedIds = selectedOrders.map((order) => order.orderId);

    const cityNames = new Set(selectedOrders.map((order) => order.cityName));
    if (cityNames.size > 1) {
      this.toastr.warning('All selected orders must be from the same city.');
      return;
    }

    const cityName = selectedOrders[0].cityName;

      const totalWeightKg = selectedOrders.reduce((sum, order) => sum + order.totalWeightKg, 0);

      forkJoin({
        drivers: this.trackerService.getAvailableDrivers(),
        vehicles: this.trackerService.getAvailableVehicles(totalWeightKg),
      })
        .pipe(
          takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: ({ drivers, vehicles }) => {
            const data: MakeShipmentDialogData = {
              orderIds: selectedIds,
              cityName,
              totalWeightKg,
              drivers: drivers.data ?? [],
              vehicles: vehicles.data ?? [],
            };

          this.dialog
            .open(MakeShipmentDialog, {
              width: '560px',
              maxWidth: '95vw',
              disableClose: true,
              data,
            })
            .afterClosed()
            .subscribe((result: MakeShipmentDialogResult) => {
              if (!result?.confirmed) {
                return;
              }
              this.trackerService
                .makeShipment({
                  orderIds: selectedIds,
                  driverId: result.driverId,
                  vehicleId: result.vehicleId,
                })
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                  next: (res) => {
                    this.toastr.success(res.data ?? 'Shipment created successfully!');

                    this.selectedOrders.set(new Map());
                    this.loadOrders();
                  },
                });
            });
        },
      });
  }

  rowIndex(index: number): number {
    return (this.page - 1) * this.pageSize + index + 1;
  }

  private clearSearch(): void {
    this.form.controls.searchControl.setValue('');
  }

  private clearSelection(): void {
    this.selectedOrders.set(new Map());
  }
}
