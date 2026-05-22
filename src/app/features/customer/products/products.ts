import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBar } from '@angular/material/progress-bar';

import { ToastrService } from 'ngx-toastr';

import { Button } from '../../../shared/components/button/button';
import { InputField } from '../../../shared/components/input-field/input-field';

import { InputFieldConfig } from '../../../shared/components/input-field/input-field.config';
import { ButtonConfig } from '../../../shared/components/button/button.config';

import { ProductService } from './services/product.service';

import { Product, AddToCartDto } from './models/product.model';

import { TruncatePipe } from '../../../shared/pipes/truncate-pipe';

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
  ],
})
export class Products implements OnInit {

  constructor(
    private readonly productService : ProductService,
    private readonly toastr : ToastrService,
    private readonly destroyRef : DestroyRef
  ){}

  readonly DEBOUNCE_MS = 400;
  readonly displayedColumns = ['index', 'name', 'description', 'price', 'actions'];
  readonly pageSizeOptions = [5, 10, 25];
  readonly products = signal<Product[]>([]);
  readonly totalCount = signal(0);
  readonly loading = signal(false);

  readonly page = signal(0);

  pageSize = 10;

  searchControl = new FormControl<string>('', {
    nonNullable: true,
  });

  searchConfig!: InputFieldConfig;

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
      control: this.searchControl,

      iconClick: () => {
        this.clearSearch();
      },
    };
  }

  private initializeSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(this.DEBOUNCE_MS),
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

    this.productService
      .getAll({
        page: this.page() + 1,
        pageSize: this.pageSize,
        search: this.searchControl.value,
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

        error: () => {
          this.toastr.error('Failed to load products.');
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
        },

        error: (err) => {
          this.toastr.error(err?.error?.message||'Something went wrong.');
        },
      });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }
}
