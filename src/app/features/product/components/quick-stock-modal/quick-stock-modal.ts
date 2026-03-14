import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../../../core/models/product.model';
import { MovementService } from '../../../movement/services/movement.service';
import { Button } from '../../../../shared/components/button/button';
import { HotToastService } from '@ngxpert/hot-toast';
import { Subject, debounceTime, distinctUntilChanged, switchMap, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-quick-stock-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, Button],
    templateUrl: './quick-stock-modal.html'
})
export class QuickStockModal {
    @Input() visible = false;
    @Output() close = new EventEmitter<boolean>();

    private productService = inject(ProductService);
    private movementService = inject(MovementService);
    private toast = inject(HotToastService);

    searchQuery = signal('');
    searchResults = signal<Product[]>([]);
    isSearching = signal(false);
    showDropdown = signal(false);

    selectedProduct = signal<Product | null>(null);
    quantity = signal<number | null>(null);
    notes = signal<string>('');

    isSubmitting = signal(false);

    private searchSubject = new Subject<string>();

    @ViewChild('searchContainer') searchContainer?: ElementRef;

    @HostListener('document:click', ['$event'])
    clickout(event: Event) {
        if (this.searchContainer &&
            !this.searchContainer.nativeElement.contains(event.target)) {
            this.showDropdown.set(false);
        }
    }

    constructor() {
        this.setupSearch();
    }

    private setupSearch() {
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(query => {
                this.isSearching.set(true);
                return this.productService.getAll(1, 10, query, false, 'ACTIVE');
            }),
            takeUntilDestroyed()
        ).subscribe({
            next: res => {
                this.searchResults.set(res.data);
                this.isSearching.set(false);
            },
            error: () => this.isSearching.set(false)
        });
    }

    onSearchChange(query: string) {
        this.searchQuery.set(query);

        if (query.length >= 1) {
            this.showDropdown.set(true);
            this.searchSubject.next(query);
        } else {
            this.searchResults.set([]);
            this.showDropdown.set(false);
        }
    }

    selectProduct(product: Product) {
        this.selectedProduct.set(product);
        this.showDropdown.set(false);
        this.searchQuery.set('');
        this.searchResults.set([]);
    }

    clearSelectedProduct() {
        this.selectedProduct.set(null);
        this.quantity.set(null);
        this.notes.set('');
    }

    onClose() {
        if (this.isSubmitting()) return;
        this.clearSelectedProduct();
        this.close.emit(false);
    }

    submit() {
        const product = this.selectedProduct();
        const qty = this.quantity();
        if (!product || !qty || qty <= 0) return;

        this.isSubmitting.set(true);

        this.movementService.create({
            type: 'IN',
            quantity: qty,
            reason: this.notes() || undefined,
            productId: product.id
        }).pipe(
            this.toast.observe({
                loading: 'Registrando ingreso...',
                success: 'Stock actualizado correctamente',
                error: (e: unknown) => {
                    const err = e as { error?: { message?: string } };
                    return err.error?.message || 'Error al actualizar el stock';
                }
            }),
            finalize(() => this.isSubmitting.set(false))
        ).subscribe({
            next: () => {
                this.clearSelectedProduct();
                this.close.emit(true);
            }
        });
    }
}
