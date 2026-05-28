import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';

import { ToastrService } from 'ngx-toastr';

import { Button } from '../../../shared/components/button/button';
import { InputField } from '../../../shared/components/input-field/input-field';

import { InputFieldConfig } from '../../../shared/components/input-field/input-field.config';
import { ButtonConfig } from '../../../shared/components/button/button.config';

import { ProductService } from './services/product.service';

import { Product, AddToCartDto } from './models/product.model';

import { TruncatePipe } from '../../../shared/pipes/truncate-pipe';
import { MatSort, Sort, MatSortHeader } from "@angular/material/sort";
import { MatTooltipModule } from '@angular/material/tooltip';
import { APP_CONSTANTS } from '../../../shared/constants/app.constants';

@Component({
  selector: 'app-product',
  standalone: true,
  templateUrl: './products.html',
  styleUrl: './products.scss',

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBar,
    Button,
    InputField,
    TruncatePipe,
    MatSort,
    MatSortHeader
  ],
})
export class Products implements OnInit {

  constructor(
    private readonly productService: ProductService,
    private readonly toastr: ToastrService,
    private readonly destroyRef: DestroyRef
  ) { }

  readonly displayedColumns = ['index', 'name', 'description', 'price', 'actions'];
  readonly pageSizeOptions = APP_CONSTANTS.PAGE_SIZE_OPTIONS

  products = signal<Product[]>([]);
  totalCount = signal(0);
  loading = signal(false);
  page = signal(0);
  sortBy = signal<string | null>(null);
  ascending = signal<boolean | null>(null);
  pageSize: number = APP_CONSTANTS.DEFAULT_PAGE_SIZE;
  searchConfig: InputFieldConfig;

  form = new FormGroup({
    searchControl: new FormControl('', { nonNullable: true }),
  });


  ngOnInit(): void {
    this.initializeConfigs();
    this.initializeSearch();
    this.loadProducts();
  }

  private initializeConfigs(): void {
    this.searchConfig = {
      label: 'Search',
      type: 'text',
      placeholder: 'Search products...',
      prefixIcon: 'search',
      icon: 'close',
      formControlName: 'searchControl',

      iconClick: () => {
        this.clearSearch();
      },
    };
  }

  private initializeSearch(): void {
    this.form.controls.searchControl.valueChanges
      .pipe(
        debounceTime(APP_CONSTANTS.SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.page.set(0);
        this.loadProducts();
      });
  }

  loadProducts(): void {
    this.loading.set(true);

    this.productService.getAll({
      page: this.page() + 1,
      pageSize: this.pageSize,
      search: this.form.controls.searchControl.value,
      sortBy: this.sortBy() ?? undefined,
      ascending: this.ascending() ?? undefined,
    })
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )

      .subscribe({
        next: (response) => {
          if (!response.isSuccess || !response.data) {
            this.toastr.error('Failed to load products.');
            return;
          }

          this.products.set(response.data.items);
          this.totalCount.set(response.data.totalCount);
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  rowIndex(index: number): number {
    return this.page() * this.pageSize + index + 1;
  }

  cartButtonConfig(product: Product): ButtonConfig {
    return {
      label: 'Add to Cart',
      variant: 'flat',
      color: 'primary',
      prefixIcon: 'shopping_cart',

      clicked: () => {
        this.addToCart(product);
      },
    };
  }

  private addToCart(product: Product): void {
    const dto: AddToCartDto = {
      productId: product.id,
      quantity: 1,
    };

    this.productService
      .addToCart(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('Product added to cart.');
        }
      });
  }
  onSortChange(sort: Sort): void {

    if (!sort.direction) {
      this.sortBy.set(null);
      this.ascending.set(null);
    } else {
      this.sortBy.set(sort.active);
      this.ascending.set(sort.direction === 'asc');
    }

    this.page.set(0);

    this.loadProducts();
  }
  clearSearch(): void {
    this.form.controls.searchControl.setValue('');
  }
}
