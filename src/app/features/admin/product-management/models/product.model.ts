// features/admin/product-management/models/product.model.ts

export interface Product {
  id: number;
  name: string;
  weightKg: number;
  stock: number;
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