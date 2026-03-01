import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../services/product.service';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';
import { TranslateModule } from '@ngx-translate/core';
import { Modal } from '../../../../shared/components/modal/modal';

@Component({
    standalone: true,
    selector: 'app-product-form',
    imports: [CommonModule, ReactiveFormsModule, TranslateModule, Modal],
    templateUrl: './product-form.html',
})
export class ProductForm implements OnInit {
    private fb = inject(FormBuilder);
    private context = inject(WorkspaceContextService);

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
            price: [this.product?.price ?? null, [Validators.required, Validators.min(0)]],
            costPrice: [this.product?.costPrice ?? null, [Validators.required, Validators.min(0)]],
            stock: [this.product?.stock ?? null, [Validators.required, Validators.min(0)]],
            stockMin: [this.product?.stockMin ?? null, [Validators.min(0)]],
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
            costPrice: Number(rawValue.costPrice),
            stock: Number(rawValue.stock),
            stockMin: rawValue.stockMin ? Number(rawValue.stockMin) : 0,
        };

        // Si estamos editando, emitimos el id y los nuevos datos
        if (this.isEditMode) {
            this.save.emit({ id: this.product!.id, data: formData });
        } else {
            // Si estamos creando, el workspaceId viaja por los interceptors (Headers)
            // No lo enviamos en el body para que el backend no tire error 400 por "non-whitelisted property".
            this.save.emit({ data: formData });
        }
    }

    onCancel() {
        this.close.emit();
    }
}
