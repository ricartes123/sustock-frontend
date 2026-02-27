import { Component, inject, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService, Product } from '../../../../features/product/services/product.service';
import { MovementService, CreateMovementDto } from '../../services/movement.service';
import { StockWarningComponent } from '../../../../shared/components/stock-warning/stock-warning.component';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
    selector: 'app-movement-create',
    standalone: true,
    imports: [CommonModule, FormsModule, StockWarningComponent],
    templateUrl: './movement-create.html',
})
export class MovementCreate implements OnInit {
    private productService = inject(ProductService);
    private movementService = inject(MovementService);
    private router = inject(Router);

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

        this.movementService.create(payload).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.router.navigate(['/movements']);
            },
            error: (err) => {
                this.isSubmitting = false;
                if (err.error?.message && typeof err.error.message === 'string' && err.error.message.includes('credibilidad')) {
                    this.warningMessage = err.error.message;
                    this.showWarning = true;
                } else if (err.error?.message) {
                    alert(Array.isArray(err.error.message) ? err.error.message.join(', ') : err.error.message);
                } else {
                    alert('Hubo un error al registrar el movimiento.');
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
