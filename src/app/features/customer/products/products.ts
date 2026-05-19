import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { Button } from '../../../shared/components/button/button';
import { InputFieldConfig } from '../../../shared/components/input-field/input-field.config';
import { ButtonConfig } from '../../../shared/components/button/button.config';
import { ProductService } from './services/product.service';
import { Product } from './models/product.model';
import { MatProgressBar } from "@angular/material/progress-bar";
import { InputField } from "../../../shared/components/input-field/input-field";
import { TruncatePipe } from "../../../shared/pipes/truncate-pipe";


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
    MatProgressBar,
    InputField,
    TruncatePipe
],
})
export class Products implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  readonly DEBOUNCE_MS = 400;
  readonly displayedColumns = ['index', 'name', 'description', 'weight', 'actions'];
  readonly pageSizeOptions = [5, 10, 25];
  products = signal<Product[]>([]);
  totalCount = signal(0);
  loading = signal(false);
  page = signal(0);
  pageSize = 10;

  searchControl = new FormControl<string>('', {
    nonNullable: true,
  });

  searchConfig: InputFieldConfig;

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

      .pipe(takeUntilDestroyed(this.destroyRef))

      .subscribe({
        next: (response) => {
          if (!response.isSuccess || !response.data) {
            this.loading.set(false);
            this.toastr.error('Failed to load products.');
            return;
          }

          this.products.set(response.data.items);
          this.totalCount.set(response.data.totalCount);
          this.loading.set(false);
        },

        error: () => {
          this.loading.set(false);
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

  addToCart(product: Product): void {
    console.log(product);
    this.toastr.success(`${product.name} added to cart.`);
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }
}
