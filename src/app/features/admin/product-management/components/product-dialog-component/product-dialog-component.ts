import { Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { ProductManagementService } from '../../services/product-management.service';
import { ProductDialogData } from '../../models/product-management.model';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Button } from '../../../../../shared/components/button/button';
import { InputFieldConfig } from '../../../../../shared/components/input-field/input-field.config';
import { ToastrService } from 'ngx-toastr';
import { ButtonConfig } from '../../../../../shared/components/button/button.config';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { TextareaFieldConfig } from '../../../../../shared/components/textarea-field/textearea-field.config';

interface ProductForm {
  name: FormControl<string>;
  weightKg: FormControl<number | null>;
  price:FormControl<number|null>;
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
    InputField,
    Button,
    TextareaField,
  ],

  templateUrl: './product-dialog-component.html',
  styleUrl: './product-dialog-component.scss',
})
export class ProductDialogComponent implements OnInit, OnDestroy {
  private productManagementService = inject(ProductManagementService);
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
  closeButtonConfig: ButtonConfig;
  productPriceConfig:InputFieldConfig;

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
        validators: [Validators.maxLength(500)],
      }),

      price: new FormControl(p?.price ?? null,{
        validators:[Validators.required,Validators.min(1),Validators.max(10000000)]
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
    this.productPriceConfig = {
      label:'Price',
      type :'number',
      placeholder:'e.g.1000',
      min:1,
      max:10000000,
      step:1,
      control:this.form.controls.price,
    }

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
    this.closeButtonConfig = {
      ariaLabel: 'Close',
      prefixIcon: 'close',
      variant: 'stroked',

      clicked: () => {
        this.cancel();
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

    const payload = this.isEdit
      ? {
          id: this.data.product.id,
          ...value,
        }
      : value;
    
    const request = this.isEdit
      ? this.productManagementService.updateProduct(this.data.product.id, payload)
      : this.productManagementService.createProduct(payload);
    request.pipe(takeUntil(this.destroy)).subscribe({
      next: (product) => {
        this.saving = false;

        this.dialogRef.close({
          saved: true,
          product,
        });
      },
    });
    this.saving = false;
  }

  cancel(): void {
    this.dialogRef.close({
      saved: false,
    });
  }
}
  