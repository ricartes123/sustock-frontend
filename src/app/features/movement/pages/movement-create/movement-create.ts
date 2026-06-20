import { Component, inject, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../../features/product/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { MovementService } from '../../services/movement.service';
import { CreateMovementDto } from '../../../../core/models/movement.model';
import { DataWarning } from '../../../../shared/components/data-warning/data-warning';
import { HotToastService } from '@ngxpert/hot-toast';
import { TranslateService } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged, finalize } from 'rxjs';

@Component({
    selector: 'app-movement-create',
    standalone: true,
    imports: [CommonModule, FormsModule, DataWarning],
    templateUrl: './movement-create.html',
})
export class MovementCreate implements OnInit {
    private productService = inject(ProductService);
    private movementService = inject(MovementService);
    private router = inject(Router);
    private toast = inject(HotToastService);
    private translate = inject(TranslateService);

    // Product search
    searchQuery = '';
    searchSubject = new Subject<string>();
    searchResults: Product[] = [];
    isSearching = false;
    showDropdown = false;

    // Selected Product
    selectedProduct: Product | null = null;

    // Movement details
    movementType: 'IN' | 'OUT' | 'ADJUSTMENT' = 'ADJUSTMENT';
    quantity: number = 1;
    reason: string = '';

    // Warning Modal
    showWarning = false;
    warningMessage = '';

    isSubmitting = false;

    @ViewChild('searchContainer') searchContainer!: ElementRef;

    @HostListener('document:click', ['$event'])
    clickout(event: Event) {
        if (this.searchContainer && !this.searchContainer.nativeElement.contains(event.target)) {
            this.showDropdown = false;
        }
    }

    ngOnInit() {
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(query => {
            this.performSearch(query);
        });
    }

    onSearchChange(query: string) {
        this.searchQuery = query;
        if (query.length >= 2) {
            this.showDropdown = true;
            this.searchSubject.next(query);
        } else {
            this.searchResults = [];
            this.showDropdown = false;
        }
    }

    performSearch(query: string) {
        this.isSearching = true;
        this.productService.getAll(1, 10, query, false, 'ACTIVE').subscribe({
            next: (res) => {
                this.searchResults = res.data;
                this.isSearching = false;
            },
            error: () => this.isSearching = false
        });
    }

    selectProduct(product: Product) {
        this.selectedProduct = product;
        this.showDropdown = false;
        this.searchQuery = '';
        // reset defaults for the new product
        this.quantity = 1;
    }

    clearProduct() {
        this.selectedProduct = null;
    }

    confirmMovement() {
        if (!this.selectedProduct || this.quantity <= 0) return;

        this.isSubmitting = true;

        const payload: CreateMovementDto = {
            type: this.movementType,
            quantity: this.quantity,
            reason: this.reason,
            productId: this.selectedProduct.id
        };

        this.movementService.create(payload).pipe(
            this.toast.observe({
                loading: this.translate.instant('TOAST.REGISTERING_MOVEMENT'),
                success: this.translate.instant('TOAST.MOVEMENT_REGISTERED'),
                error: (e: unknown) => {
                    const err = e as { error?: { message?: string | string[] } };
                    if (typeof err.error?.message === 'string' && err.error.message.includes('Stock insuficiente')) {
                        return this.translate.instant('TOAST.STOCK_WARNING_DETECTED');
                    }
                    if (err.error?.message) {
                        return Array.isArray(err.error.message) ? err.error.message.join(', ') : err.error.message;
                    }
                    return this.translate.instant('TOAST.ERROR_REGISTERING_MOVEMENT');
                }
            }),
            finalize(() => this.isSubmitting = false)
        ).subscribe({
            next: () => {
                this.router.navigate(['/movements']);
            },
            error: (err) => {
                if (err.error?.message && typeof err.error.message === 'string' && err.error.message.includes('Stock insuficiente')) {
                    this.warningMessage = err.error.message;
                    this.showWarning = true;
                }
            }
        });
    }

    get resultingStock(): number {
        if (!this.selectedProduct) return 0;
        if (this.movementType === 'IN') return this.selectedProduct.stock + this.quantity;
        if (this.movementType === 'OUT') return this.selectedProduct.stock - this.quantity;
        return this.quantity; // ADJUSTMENT mode
    }

    onWarningCancel() {
        this.showWarning = false;
    }

    onWarningConfirm() {
        this.showWarning = false;
    }
}
