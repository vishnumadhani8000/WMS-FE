import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
import { StateService } from './services/state-service';
import { CityService } from './services/city-service';
import { City, State } from './models/state-city.model';
import { InputFieldConfig } from '../../../shared/components/input-field/input-field.config';
import { ButtonConfig } from '../../../shared/components/button/button.config';
import { StateDialogComponent } from './components/state-dialog-component/state-dialog-component';
import { CityDialogComponent } from './components/city-dialog-component/city-dialog-component';

@Component({
  selector: 'app-state-city-management',
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

  templateUrl: './state-city-management.html',
  styleUrl: './state-city-management.scss',
})
export class StateCityManagement implements OnInit {
  private readonly stateService = inject(StateService);
  private readonly cityService = inject(CityService);
  private readonly dialog = inject(MatDialog);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  readonly DEBOUNCE_MS = 400;
  readonly pageSizeOptions = [5, 10, 25];

  readonly stateColumns = ['index', 'name', 'actions'];
  readonly cityColumns = ['index', 'name', 'actions'];

  states = signal<State[]>([]);
  stateTotalCount = signal(0);
  stateLoading = signal(false);

  cities = signal<City[]>([]);
  cityTotalCount = signal(0);
  cityLoading = signal(false);

  selectedState = signal<State | null>(null);

  statePage = signal(0);
  cityPage = signal(0);

  statePageSize = 10;
  cityPageSize = 10;

  stateSortBy: string | null = 'createdAt';
  stateSortAsc: boolean | null = false;

  citySortBy: string | null = 'createdAt';
  citySortAsc: boolean | null = false;

  stateSearchControl = new FormControl<string>('', { nonNullable: true });
  citySearchControl = new FormControl<string>('', { nonNullable: true });

  stateSearchConfig: InputFieldConfig;
  citySearchConfig: InputFieldConfig;

  addStateButtonConfig: ButtonConfig;
  addCityButtonConfig: ButtonConfig;
  ngOnInit(): void {
    this.initializeConfigs();
    this.initializeSearch();
    this.loadStates();
  }

  private initializeConfigs(): void {
    this.stateSearchConfig = {
      label: 'Search',
      type: 'text',
      placeholder: 'Search states...',
      prefixIcon: 'search',
      icon: 'close',
      control: this.stateSearchControl,

      iconClick: () => {
        this.clearStateSearch();
      },
    };

    this.citySearchConfig = {
      label: 'Search',
      type: 'text',
      placeholder: 'Search cities...',
      prefixIcon: 'search',
      icon: 'close',
      control: this.citySearchControl,

      iconClick: () => {
        this.clearCitySearch();
      },
    };

    this.addStateButtonConfig = {
      label: 'Add State',
      variant: 'flat',
      color: 'primary',
      prefixIcon: 'add',

      clicked: () => {
        this.openAddStateDialog();
      },
    };

    this.addCityButtonConfig = {
      label: 'Add City',
      variant: 'flat',
      color: 'primary',
      prefixIcon: 'add',
      disabled: !this.selectedState(),
      clicked: () => {
        this.openAddCityDialog();
      },
    };
  }

  private initializeSearch(): void {
    this.stateSearchControl.valueChanges
      .pipe(
        debounceTime(this.DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )

      .subscribe(() => {
        this.statePage.set(0);
        this.loadStates();
      });

    this.citySearchControl.valueChanges
      .pipe(
        debounceTime(this.DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )

      .subscribe(() => {
        this.cityPage.set(0);
        this.loadCities();
      });
  }

  loadStates(): void {
    this.stateLoading.set(true);

    this.stateService
      .getStates({
        page: this.statePage() + 1,
        pageSize: this.statePageSize,
        search: this.stateSearchControl.value,
        sortBy: this.stateSortBy ?? undefined,
        ascending: this.stateSortAsc ?? undefined,
      })

      .pipe(takeUntilDestroyed(this.destroyRef))

      .subscribe({
        next: (res) => {
          this.states.set(res.items);
          this.stateTotalCount.set(res.totalCount);
          this.stateLoading.set(false);
        },

        error: () => {
          this.stateLoading.set(false);

          this.toastr.error('Failed to load states.');
        },
      });
  }

  loadCities(): void {
    const state = this.selectedState();

    if (!state) {
      return;
    }

    this.cityLoading.set(true);

    this.cityService
      .getCities({
        stateId: state.id,
        page: this.cityPage() + 1,
        pageSize: this.cityPageSize,
        search: this.citySearchControl.value,
        sortBy: this.citySortBy ?? undefined,
        ascending: this.citySortAsc ?? undefined,
      })

      .pipe(takeUntilDestroyed(this.destroyRef))

      .subscribe({
        next: (res) => {
          this.cities.set(res.items);
          this.cityTotalCount.set(res.totalCount);
          this.cityLoading.set(false);
        },

        error: () => {
          this.cityLoading.set(false);
          this.toastr.error('Failed to load cities.');
        },
      });
  }

  onStateSortChange(sort: Sort): void {
    if (!sort.direction) {
      this.stateSortBy = null;
      this.stateSortAsc = null;
    } else {
      this.stateSortBy = sort.active;
      this.stateSortAsc = sort.direction === 'asc';
    }

    this.statePage.set(0);
    this.loadStates();
  }

  onCitySortChange(sort: Sort): void {
    if (!sort.direction) {
      this.citySortBy = null;
      this.citySortAsc = null;
    } else {
      this.citySortBy = sort.active;
      this.citySortAsc = sort.direction === 'asc';
    }

    this.cityPage.set(0);

    this.loadCities();
  }

  onStatePageChange(event: PageEvent): void {
    this.statePage.set(event.pageIndex);
    this.statePageSize = event.pageSize;

    this.loadStates();
  }

  onCityPageChange(event: PageEvent): void {
    this.cityPage.set(event.pageIndex);
    this.cityPageSize = event.pageSize;
    this.loadCities();
  }

  selectState(state: State): void {
    this.selectedState.set(state);
    this.cityPage.set(0);
    this.addCityButtonConfig.disabled = false;
    this.citySearchControl.setValue('');
    this.loadCities();
  }

  stateRowIndex(index: number): number {
    return this.statePage() * this.statePageSize + index + 1;
  }

  cityRowIndex(index: number): number {
    return this.cityPage() * this.cityPageSize + index + 1;
  }

  openAddStateDialog(): void {
    this.dialog
      .open(StateDialogComponent, {
        width: '480px',

        data: {
          mode: 'add',
        },
        disableClose: true,
      })

      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res?.saved) {
          return;
        }

        this.loadStates();
      });
  }

  openEditStateDialog(state: State): void {
    this.dialog
      .open(StateDialogComponent, {
        width: '480px',

        data: {
          mode: 'edit',
          state,
        },

        disableClose: true,
      })
      

      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res?.saved) {
          return;
        }

        this.loadStates();
      });
  }

  openAddCityDialog(): void {
    const state = this.selectedState();

    if (!state) {
      return;
    }

    this.dialog
      .open(CityDialogComponent, {
        width: '480px',

        data: {
          mode: 'add',
          stateId: state.id,
          stateName: state.name,
        },
        disableClose : true
      })

      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res?.saved) {
          return;
        }

        this.loadCities();
      });
  }

  openEditCityDialog(city: City): void {
    const state = this.selectedState();

    if (!state) {
      return;
    }

    this.dialog
      .open(CityDialogComponent, {
        width: '480px',

        data: {
          mode: 'edit',
          stateId: state.id,
          stateName: state.name,
          city,
        },
        disableClose: true,
      })

      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res?.saved) {
          return;
        }

        this.loadCities();
      });
  }

  deleteState(state: State): void {
    if (!confirm(`Delete "${state.name}"?`)) {
      return;
    }

    this.stateService
      .deleteState(state.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('State deleted.');

          if (this.selectedState()?.id === state.id) {
            this.selectedState.set(null);
            this.cities.set([]);
          }

          this.loadStates();
        },

        error: () => {
          this.toastr.error('Failed to delete state.');
        },
      });
  }

  deleteCity(city: City): void {
    if (!confirm(`Delete "${city.name}"?`)) {
      return;
    }

    this.cityService
      .deleteCity(city.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('City deleted.');
          this.loadCities();
        },

        error: () => {
          this.toastr.error('Failed to delete city.');
        },
      });
  }

  clearStateSearch(): void {
    this.stateSearchControl.setValue('');
  }

  clearCitySearch(): void {
    this.citySearchControl.setValue('');
  }
}
