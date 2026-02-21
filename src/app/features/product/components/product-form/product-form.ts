import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../services/product.service';
import { BusinessContextService } from '../../../../core/services/business-context.service';

@Component({
    standalone: true,
    selector: 'app-product-form',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './product-form.html',
})
export class ProductForm implements OnInit {
    private fb = inject(FormBuilder);
    private context = inject(BusinessContextService);

    @Input() product: Product | null = null;
    @Input() isSaving = false;
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<{ id?: string; data: Partial<Product> }>();

    productForm!: FormGroup;

    ngOnInit() {
        this.productForm = this.fb.group({
            name: [this.product?.name || '', [Validators.required, Validators.maxLength(100)]],
            sku: [this.product?.sku || ''],
            barcode: [this.product?.barcode || ''],
            price: [this.product?.price || 0, [Validators.required, Validators.min(0)]],
            stock: [this.product?.stock || 0, [Validators.required, Validators.min(0)]],
            minStock: [this.product?.minStock || 0, [Validators.min(0)]],
        });
    }

    get isEditMode() {
        return !!this.product;
    }

    get currencySymbol() {
        return this.context.currencySymbol;
    }

    onSubmit() {
        if (this.productForm.invalid || this.isSaving) {
            this.productForm.markAllAsTouched();
            return;
        }

        const rawValue = this.productForm.value;
        const formData = {
            ...rawValue,
            price: Number(rawValue.price),
            stock: Number(rawValue.stock),
            minStock: rawValue.minStock ? Number(rawValue.minStock) : 0,
        };

        // Si estamos editando, emitimos el id y los nuevos datos
        if (this.isEditMode) {
            this.save.emit({ id: this.product!.id, data: formData });
        } else {
            // Si estamos creando, el businessId viaja por los interceptors (Headers)
            // No lo enviamos en el body para que el backend no tire error 400 por "non-whitelisted property".
            this.save.emit({ data: formData });
        }
    }

    onCancel() {
        this.close.emit();
    }
}
