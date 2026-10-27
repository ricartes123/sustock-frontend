import { Component, inject, signal, computed, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ProductService } from '../../../../features/product/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { MovementService } from '../../services/movement.service';
import { CreateMovementDto, MovementType } from '../../../../core/models/movement.model';
import { DataWarning } from '../../../../shared/components/data-warning/data-warning';
import { HotToastService } from '@ngxpert/hot-toast';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, switchMap, tap } from 'rxjs';

// An adjustment sets the final stock, so it may legitimately be 0
const minQuantity = (type: MovementType) => (type === 'ADJUSTMENT' ? 0 : 1);

@Component({
    selector: 'app-movement-create',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DataWarning],
    templateUrl: './movement-create.html',
})
export class MovementCreate {
    private fb = inject(NonNullableFormBuilder);
    private productService = inject(ProductService);
    private movementService = inject(MovementService);
    private router = inject(Router);
    private toast = inject(HotToastService);

    // Product search
    searchControl = this.fb.control('');
    searchResults = signal<Product[]>([]);
    isSearching = signal(false);
    showDropdown = signal(false);

    selectedProduct = signal<Product | null>(null);

    form = this.fb.group({
        type: this.fb.control<MovementType>('ADJUSTMENT'),
        quantity: this.fb.control(1, [Validators.required, Validators.min(minQuantity('ADJUSTMENT'))]),
        reason: this.fb.control(''),
    });

    private formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

    resultingStock = computed(() => {
        const product = this.selectedProduct();
        if (!product) return 0;

        const { type, quantity } = this.formValue();
        const amount = quantity ?? 0;

        if (type === 'IN') return product.stock + amount;
        if (type === 'OUT') return product.stock - amount;
        return amount;
    });

    // Warning Modal
    showWarning = signal(false);
    warningMessage = signal('');

    isSubmitting = signal(false);

    @ViewChild('searchContainer') searchContainer!: ElementRef;

    @HostListener('document:click', ['$event'])
    clickout(event: Event) {
        if (this.searchContainer && !this.searchContainer.nativeElement.contains(event.target)) {
            this.showDropdown.set(false);
        }
    }

    constructor() {
        this.form.controls.type.valueChanges.pipe(takeUntilDestroyed()).subscribe(type => {
            const quantity = this.form.controls.quantity;
            quantity.setValidators([Validators.required, Validators.min(minQuantity(type))]);
            quantity.updateValueAndValidity();
        });

        this.searchControl.valueChanges.pipe(
            tap(query => {
                this.showDropdown.set(query.length >= 2);
                if (query.length < 2) this.searchResults.set([]);
            }),
            debounceTime(300),
            distinctUntilChanged(),
            // switchMap drops stale responses when the user keeps typing
            switchMap(query => {
                if (query.length < 2) return of(null);

                this.isSearching.set(true);
                return this.productService.getAll(1, 10, query, false, 'ACTIVE').pipe(
                    catchError(() => {
                        this.toast.error('No se pudieron buscar productos.');
                        return of(null);
                    }),
                    finalize(() => this.isSearching.set(false))
                );
            }),
            takeUntilDestroyed()
        ).subscribe(res => {
            if (res) this.searchResults.set(res.data);
        });
    }

    onSearchFocus() {
        if (!this.selectedProduct() && this.searchControl.value.length >= 2) {
            this.showDropdown.set(true);
        }
    }

    selectProduct(product: Product) {
        this.selectedProduct.set(product);
        this.showDropdown.set(false);
        this.searchResults.set([]);
        this.searchControl.setValue('', { emitEvent: false });
        this.searchControl.disable({ emitEvent: false });
        this.form.controls.quantity.setValue(1);
    }

    clearProduct() {
        this.selectedProduct.set(null);
        this.searchControl.enable({ emitEvent: false });
    }

    setType(type: MovementType) {
        this.form.controls.type.setValue(type);
    }

    confirmMovement() {
        const product = this.selectedProduct();
        if (!product || this.form.invalid) return;

        const { type, quantity, reason } = this.form.getRawValue();
        this.isSubmitting.set(true);

        const payload: CreateMovementDto = {
            type,
            quantity,
            reason,
            productId: product.id
        };

        this.movementService.create(payload).pipe(
            this.toast.observe({
                loading: 'Registrando movimiento...',
                success: 'Movimiento registrado correctamente',
                error: (e: unknown) => {
                    const err = e as { error?: { message?: string | string[] } };
                    if (typeof err.error?.message === 'string' && err.error.message.includes('Stock insuficiente')) {
                        return 'Advertencia de stock detectada';
                    }
                    if (err.error?.message) {
                        return Array.isArray(err.error.message) ? err.error.message.join(', ') : err.error.message;
                    }
                    return 'Error al registrar el movimiento';
                }
            }),
            finalize(() => this.isSubmitting.set(false))
        ).subscribe({
            next: () => {
                this.router.navigate(['/movements']);
            },
            error: (err) => {
                if (err.error?.message && typeof err.error.message === 'string' && err.error.message.includes('Stock insuficiente')) {
                    this.warningMessage.set(err.error.message);
                    this.showWarning.set(true);
                }
            }
        });
    }

    onWarningCancel() {
        this.showWarning.set(false);
    }

    onWarningConfirm() {
        this.showWarning.set(false);
    }
}
