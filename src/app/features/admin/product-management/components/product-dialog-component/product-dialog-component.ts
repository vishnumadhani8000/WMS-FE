import { Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { ProductService } from '../../services/product.service';
import { ProductDialogData } from '../../models/product.model';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Button } from '../../../../../shared/components/button/button';
import { InputFieldConfig } from '../../../../../shared/components/input-field/input-field.config';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-dialog',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDividerModule,
    MatIcon,
    InputField,
    Button,
  ],

  templateUrl: './product-dialog-component.html',
  styleUrl: './product-dialog-component.scss',
})
export class ProductDialogComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private dialogRef = inject(MatDialogRef<ProductDialogComponent>);
  private destroy = new Subject<void>();
  private toastr = inject(ToastrService);

  productNameConfig : InputFieldConfig = {
    label : 'Product Name',
    type  : 'text',
    placeholder:"e.g. Wireless Keyboard",
    maxlength:100,
    subscriptSizing:"dynamic",
    trimStart : true
  } 
  name :string ;
  weightConfig : InputFieldConfig = {
    reruired : true,
    label : 'Weight (kg)',
    type  : 'number',
    placeholder:"e.g. 0.850",
    min:0.001,
    max:9999,
    step: 0.001,
    subscriptSizing:"dynamic",
    // trimStart : true
  }
  stockConfig : InputFieldConfig = {
    label : 'Stock Quantity',
    type  : 'number',
    placeholder:"e.g. 100",
    min:0,
    max:1000000,
    step: 1,
    subscriptSizing:"dynamic",  
  }
  descriptionConfig : InputFieldConfig = {
    label : 'Description',
    type  : 'text',
    placeholder:"Optional short product description...",
    maxlength:500,
    subscriptSizing:"dynamic",
    trimStart : true
  }

  form!: FormGroup;

  saving = false;

  get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  get title(): string {
    return this.isEdit ? 'Edit Product' : 'Add Product';
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: ProductDialogData
  ) {}

  ngOnInit(): void {
    const product = this.data.product;

    this.form = this.fb.group({
      name: [product?.name ?? '', [Validators.required, Validators.maxLength(100)]],

      weightKg: [
        // product?.weightKg ?? 0,
        [Validators.required, Validators.min(0.001), Validators.max(9999)],
      ],

      stock: [
        product?.stock ?? 0,
        [Validators.required, Validators.min(0), Validators.max(1000000)],
      ],

      description: [product?.description ?? '', [Validators.maxLength(500)]],
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  submit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    const value = this.form.getRawValue();

    const request$ = this.isEdit
      ? this.productService.updateProduct(this.data.product.id, value)
      : this.productService.createProduct(value);

    request$.pipe(takeUntil(this.destroy)).subscribe({
      next: (product) => {
        this.saving = false;

        this.dialogRef.close({
          saved: true,
          product,
        });
      },

      error: () => {
        this.saving = false;
        this.toastr.error('somethidg went wrong ');
      },
    });
  }

  cancel(): void {
    this.dialogRef.close({
      saved: false,
    });
  }
}
