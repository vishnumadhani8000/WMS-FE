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

import { ProductManagementService } from './services/product-management.service';
import { Product } from './models/product-management.model';
import { ProductDialogComponent } from './components/product-dialog-component/product-dialog-component';

import { InputField } from '../../../shared/components/input-field/input-field';
import { Button } from '../../../shared/components/button/button';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

import { TruncatePipe } from '../../../shared/pipes/truncate-pipe';
import { InputFieldConfig } from '../../../shared/components/input-field/input-field.config';
import { ButtonConfig } from '../../../shared/components/button/button.config';

import { APP_CONSTANTS } from '../../../shared/constants/app.constants';

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

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  readonly displayedColumns = [
    'index',
    'name',
    'weightKg',
    'stock',
    'price',
    'description',
    'actions',
  ];

  readonly pageSizeOptions = APP_CONSTANTS.PAGE_SIZE_OPTIONS;

  dataSource: Product[] = [];
  totalCount = 0;

  page = 0;
  pageSize: number = APP_CONSTANTS.DEFAULT_PAGE_SIZE;

  sortBy: string | null = 'createdAt';
  sortAsc: boolean | null = false;

  form = new FormGroup({
    searchControl: new FormControl('', {
      nonNullable: true,
    }),
  });

  searchInputConfig: InputFieldConfig;
  addProductButtonConfig: ButtonConfig;

  constructor(
    private readonly productManagementService: ProductManagementService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.initializeConfigs();
    this.initializeSearch();
    this.loadProducts();
  }

  loadProducts(): void {
    this.productManagementService
      .getProducts({
        page: this.page + 1,
        pageSize: this.pageSize,
        search: this.form.controls.searchControl.value,
        sortBy: this.sortBy,
        ascending: this.sortAsc,
      })
      .pipe(
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

    this.loadProducts();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.direction
      ? sort.active
      : null;

    this.sortAsc = sort.direction
      ? sort.direction === 'asc'
      : null;

    this.page = 0;
    this.loadProducts();
  }

  rowIndex(index: number): number {
    return this.page * this.pageSize + index + 1;
  }

  clearSearch(): void {
    this.form.controls.searchControl.setValue('');
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

        this.productManagementService
          .deleteProduct(product.id)
          .pipe(
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe({
            next: () => {
              this.toastr.warning('Product deleted.');

              const isLastItemOnPage =
                this.dataSource.length === 1 &&
                this.page > 0;

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
    this.loadProducts();
  }

  initializeConfigs(): void {
    this.searchInputConfig = {
      label: 'Search',
      type: 'text',
      placeholder: 'Search products...',
      prefixIcon: 'search',
      icon: 'close',
      trimStart: true,
      formControlName: 'searchControl',
      iconClick: () => this.clearSearch(),
    };

    this.addProductButtonConfig = {
      label: 'Add Product',
      variant: 'flat',
      color: 'primary',
      prefixIcon: 'add',
      clicked: () => this.openAddDialog(),
    };
  }

  initializeSearch(): void {
    this.form.controls.searchControl.valueChanges
      .pipe(
        debounceTime(APP_CONSTANTS.SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.page = 0;
        this.loadProducts();
      });
  }
}