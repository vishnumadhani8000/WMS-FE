// features/admin/product-management/models/product.model.ts

import { FormControl } from "@angular/forms";

export interface Product {
  id: number;
  name: string;
  weightKg: number;
  stock: number;
  price:number;
  description?: string;
}

export interface ProductFilter {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string | null;
  ascending?: boolean | null;
}
export interface ProductFormValue {
  name: string;
  weightKg: number;
  stock: number;
  description: string;
}

export interface ProductDialogData {
  mode: 'add' | 'edit';
  product?: Product;
}

export interface ProductForm {
  name: FormControl<string>;
  weightKg: FormControl<number | null>;
  price:FormControl<number|null>;
  stock: FormControl<number | null>;
  description: FormControl<string>;
}