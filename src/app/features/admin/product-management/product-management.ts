import { Component, DestroyRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, switchMap } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { ProductManagementService } from './services/product-management.service';
import { Product, ProductFilter } from './models/product-management.model';
import { ProductDialogComponent } from './components/product-dialog-component/product-dialog-component';
import { InputField } from '../../../shared/components/input-field/input-field';
import { Button } from '../../../shared/components/button/button';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { TruncatePipe } from '../../../shared/pipes/truncate-pipe';
import { InputFieldConfig } from '../../../shared/components/input-field/input-field.config';
import { ButtonConfig } from '../../../shared/components/button/button.config';

@Component({
  selector: 'app-product-management',
  standalone: true,
  templateUrl: './product-management.html',
  styleUrl: './product-management.scss',

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
export class ProductManagement implements OnInit {
  private readonly productManagementService = inject(ProductManagementService);
  private readonly dialog = inject(MatDialog);
  private readonly toastr = inject(ToastrService);
  private readonly destroyref = inject(DestroyRef);

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  readonly DEBOUNCE_MS = 500;
  readonly displayedColumns = ['index', 'name', 'weightKg', 'stock','price', 'description', 'actions'];
  readonly pageSizeOptions = [5, 10, 25];

  dataSource = signal<Product[]>([]);
  totalCount = signal(0);
  loading = signal(false);

  searchControl = new FormControl<string>('', {
    nonNullable: true,
  });

  searchInputConfig: InputFieldConfig;
  addProductButtonConfig: ButtonConfig;

  readonly filter = new BehaviorSubject<ProductFilter>({
    page: 1,
    pageSize: 10,
    search: '',
    sortBy: 'createdAt',
    ascending: false,
  });

  ngOnInit(): void {
    // Search Config
    this.searchInputConfig = {
      label: 'Search',
      type: 'text',
      placeholder: 'Search products...',
      prefixIcon: 'search',
      icon: 'close',
      subscriptSizing: 'dynamic',
      trimStart: true,

      control: this.searchControl,

      iconClick: () => {
        this.clearSearch();
      },
    };

    // Add Button Config
    this.addProductButtonConfig = {
      label: 'Add Product',
      variant: 'flat',
      color: 'primary',
      prefixIcon: 'add',

      clicked: () => {
        this.openAddDialog();
      },
    };

    this.initializeSearch();
    this.initializeProductLoader();
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

  private initializeProductLoader(): void {
    this.filter
      .pipe(
        switchMap((filter) => {
          this.loading.set(true);

          return this.productManagementService.getProducts(filter);
        }),

        takeUntilDestroyed(this.destroyref)
      )

      .subscribe({
        next: (result) => {
          this.dataSource.set(result.items);
          this.totalCount.set(result.totalCount);
          this.loading.set(false);
        },

        error: () => {
          this.loading.set(false);
          this.toastr.error('Failed to load products.');
        },
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
      .open(ProductDialogComponent, {
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
        this.toastr.success('Product added successfully.');

        this.reload();
      });
  }

  openEditDialog(product: Product): void {
    this.dialog
      .open(ProductDialogComponent, {
        data: {
          mode: 'edit',
          product,
        },
        disableClose: true,
      })

      .afterClosed()
      .subscribe((result) => {
        if (!result?.saved) {
          return;
        }

        this.toastr.success('Product updated successfully.');

        this.reload();
      });
  }

  deleteProduct(product: Product): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        disableClose: true,

        data: {
          title: 'Delete Product',
          message: `Are you sure you want to delete "${product.name}"?`,
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

        this.productManagementService.deleteProduct(product.id).subscribe({
          next: () => {
            this.toastr.warning('Product deleted.');

            const isLastItemOnPage = this.dataSource().length === 1 && this.filter.value.page > 1;

            if (isLastItemOnPage) {
              this.paginator.previousPage();
            } else {
              this.reload();
            }
          },

          error: () => {
            this.toastr.error('Failed to delete product.');
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
