// product-management.ts

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
import { ProductService } from './services/product.service';
import { Product, ProductFilter } from './models/product.model';
import { InputField } from '../../../shared/components/input-field/input-field';
import { Button } from '../../../shared/components/button/button';
import { ProductDialogComponent } from './components/product-dialog-component/product-dialog-component';
import { TruncatePipe } from '../../../shared/pipes/truncate-pipe';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

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
export class ProductManagement implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly dialog = inject(MatDialog);
  private readonly toastr = inject(ToastrService);
  private readonly destroy$ = new Subject<void>();

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  readonly DEBOUNCE_MS = 500;
  readonly displayedColumns = ['index', 'name', 'weightKg', 'stock', 'description', 'actions'];
  readonly pageSizeOptions = [5, 10, 25];
  dataSource = signal<Product[]>([]);
  totalCount = signal(0);
  loading = signal(false);
  pageSize = 10;
  currentPage = signal(0);  
  sortBy: string | null = 'createdAt';
  ascending: boolean | null = false;
  searchControl = new FormControl<string>('', { nonNullable: true });

  private readonly filter$ = new BehaviorSubject<ProductFilter>({
    page: 1,
    pageSize: 10,
    search: '',
    sortBy: 'createdAt',
    ascending: false,
  });

  ngOnInit(): void {
    this.initializeSearch();

    this.initializeProductLoader();
  }

  ngOnDestroy(): void {
    this.destroy$.next();

    this.destroy$.complete();
  }

  private initializeSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(this.DEBOUNCE_MS), distinctUntilChanged(), takeUntil(this.destroy$))

      .subscribe((search) => {
        this.currentPage.set(0);

        this.paginator?.firstPage();

        this.filter$.next({
          page: 1,
          pageSize: this.pageSize,
          search,
          sortBy: this.sortBy,
          ascending: this.ascending,
        });
      });
  }

  private initializeProductLoader(): void {
    this.filter$
      .pipe(
        switchMap((filter) => {
          this.loading.set(true);

          return this.productService.getProducts(filter);
        }),

        takeUntil(this.destroy$)
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

          this.toastr.error('Failed to load products.');
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage.set(event.pageIndex);
    this.filter$.next({
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
    }
    else {
      this.sortBy = sort.active;
      this.ascending = sort.direction === 'asc';
    }

    this.currentPage.set(0);

    this.paginator?.firstPage();

    this.filter$.next({
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
      .open(ProductDialogComponent, {
        data: {
          mode: 'add',
        },
        panelClass: 'product-dialog-panel',
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

        panelClass: 'product-dialog-panel',

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

        this.productService
          .deleteProduct(product.id)

          .pipe(takeUntil(this.destroy$))

          .subscribe({
            next: () => {
              this.toastr.warning('Product deleted.');

              const isLastItemOnPage = this.dataSource().length === 1 && this.currentPage() > 0;

              if (isLastItemOnPage) {
                this.currentPage.update(v => v - 1);

                this.paginator?.previousPage();
              }

              this.reload();
            },

            error: () => {
              this.toastr.error('Failed to delete product.');
            },
          });
      });
  }
  private reload(): void {
    this.filter$.next({
      page: this.currentPage() + 1,
      pageSize: this.pageSize,
      search: this.searchControl.value,

      sortBy: this.sortBy,
      ascending: this.ascending,
    });
  }
}
