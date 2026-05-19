import { Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { ButtonConfig } from '../../../../../shared/components/button/button.config';
import { TextareaField } from "../../../../../shared/components/textarea-field/textarea-field";
import { TextareaFieldConfig } from '../../../../../shared/components/textarea-field/textearea-field.config';

interface ProductForm {
  name: FormControl<string>;
  weightKg: FormControl<number | null>;
  stock: FormControl<number | null>;
  description: FormControl<string>;
}

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
    TextareaField
],

  templateUrl: './product-dialog-component.html',
  styleUrl: './product-dialog-component.scss',
})
export class ProductDialogComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private dialogRef = inject(MatDialogRef<ProductDialogComponent>);
  private toastr = inject(ToastrService);
  private destroy = new Subject<void>();
  saving = false;
  form: FormGroup<ProductForm>;
  productNameConfig: InputFieldConfig;
  weightConfig: InputFieldConfig;
  stockConfig: InputFieldConfig;
  descriptionConfig: TextareaFieldConfig;
  cancelButtonConfig: ButtonConfig;
  submitButtonConfig: ButtonConfig;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: ProductDialogData
  ) {}

  get isEdit(): boolean {
    return this.data.mode === 'edit';
  }

  get title(): string {
    return this.isEdit ? 'Edit Product' : 'Add Product';
  }

  ngOnInit(): void {
    const p = this.data.product;

   
    this.form = new FormGroup<ProductForm>({
      name: new FormControl(p?.name ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100)],
      }),

      weightKg: new FormControl(p?.weightKg ?? null, {
        validators: [Validators.required, Validators.min(0.001), Validators.max(9999)],
      }),

      stock: new FormControl(p?.stock ?? null, {
        validators: [Validators.required, Validators.min(0), Validators.max(1000000)],
      }),

      description: new FormControl(p?.description ?? '', {
        nonNullable: true,
        validators: [ Validators.maxLength(500)],
      }),
    });

    this.productNameConfig = {
      label: 'Product Name',
      type: 'text',
      placeholder: 'e.g. Wireless Keyboard',
      maxlength: 100,
      subscriptSizing: 'dynamic',
      trimStart: true,
      control: this.form.controls.name,
    };

    this.weightConfig = {
      label: 'Weight (kg)',
      type: 'number',
      placeholder: 'e.g. 0.850',
      min: 0.001,
      max: 9999,
      step: 0.001,
      subscriptSizing: 'dynamic',
      control: this.form.controls.weightKg,
    };

    this.stockConfig = {
      label: 'Stock Quantity',
      type: 'number',
      placeholder: 'e.g. 100',
      min: 0,
      max: 1000000,
      step: 1,
      subscriptSizing: 'dynamic',
      control: this.form.controls.stock,
    };

    this.descriptionConfig = {
      label: 'Description',
      placeholder: 'Optional short product description...',
      maxlength: 500,
      rows: 3,
      trimStart: true,
      control: this.form.controls.description,
    };
    
    this.cancelButtonConfig = {
      label: 'Cancel',
      variant: 'stroked',
      color: 'default',

      clicked: () => {
        this.cancel();
      },
    };

    this.submitButtonConfig = {
      label: this.isEdit ? 'Save Changes' : 'Add Product',
      variant: 'flat',
      color: 'primary',
      loading: this.saving,
      disabled: this.saving,

      clicked: () => {
        this.submit();
      },
    };
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

    const request = this.isEdit
      ? this.productService.updateProduct(this.data.product.id, value)
      : this.productService.createProduct(value);

    request.pipe(takeUntil(this.destroy)).subscribe({
      next: (product) => {
        this.saving = false;

        this.dialogRef.close({
          saved: true,
          product,
        });
      },

      error: () => {
        this.saving = false;

        this.toastr.error('Something went wrong');
      },
    });
  }

  cancel(): void {
    this.dialogRef.close({
      saved: false,
    });
  }
}
