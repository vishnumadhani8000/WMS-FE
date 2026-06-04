import { Component, DestroyRef, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSort, Sort, MatSortHeader } from '@angular/material/sort';

import { ToastrService } from 'ngx-toastr';

import { signal } from '@angular/core';

import { Button } from '../../../shared/components/button/button';
import { InputField } from '../../../shared/components/input-field/input-field';

import { InputFieldConfig } from '../../../shared/components/input-field/input-field.config';
import { ButtonConfig } from '../../../shared/components/button/button.config';

import { ProductService } from './services/product.service';

import { Product, AddToCartDto } from './models/product.model';

import { TruncatePipe } from '../../../shared/pipes/truncate-pipe';
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
    Button,
    InputField,
    TruncatePipe,
    MatSort,
    MatSortHeader,
  ],
})
export class Products implements OnInit {
  readonly displayedColumns = ['index', 'name', 'description', 'price', 'actions'];

  readonly pageSizeOptions = APP_CONSTANTS.PAGE_SIZE_OPTIONS;

  readonly products = signal<Product[]>([]);
  readonly totalCount = signal(0);
  readonly page = signal(0);

  pageSize: number = APP_CONSTANTS.DEFAULT_PAGE_SIZE;

  private sortBy: string | null = null;
  private ascending: boolean | null = null;

  searchConfig!: InputFieldConfig;

  readonly form = new FormGroup({
    searchControl: new FormControl('', { nonNullable: true }),
  });

  constructor(
    private readonly productService: ProductService,
    private readonly toastr: ToastrService,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.initializeConfigs();
    this.initializeSearch();
    this.loadProducts();
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
      clicked: () => this.addToCart(product),
    };
  }

  onSortChange(sort: Sort): void {
    if (!sort.direction) {
      this.sortBy = null;
      this.ascending = null;
    } else {
      this.sortBy = sort.active;
      this.ascending = sort.direction === 'asc';
    }

    this.page.set(0);
    this.loadProducts();
  }

  clearSearch(): void {
    this.form.controls.searchControl.setValue('');
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
  private initializeConfigs(): void {
    this.searchConfig = {
      label: 'Search',
      type: 'text',
      placeholder: 'Search products...',
      prefixIcon: 'search',
      icon: 'close',
      formControlName: 'searchControl',
      iconClick: () => this.clearSearch(),
    };
  }
  private loadProducts(): void {
    this.productService
      .getAll({
        page: this.page() + 1,
        pageSize: this.pageSize,
        search: this.form.controls.searchControl.value,
        sortBy: this.sortBy ?? undefined,
        ascending: this.ascending ?? undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
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
        },
      });
  }
}
