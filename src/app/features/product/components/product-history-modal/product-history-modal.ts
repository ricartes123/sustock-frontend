import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService, Product } from '../../services/product.service';
import { Button } from '../../../../shared/components/button/button';
import { Badge } from '../../../../shared/components/badge/badge';
import { finalize } from 'rxjs';

export interface Movement {
    id: string;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    quantity: number;
    reason?: string;
    createdAt: string;
    user?: {
        firstName: string;
        lastName: string;
    };
    sale?: {
        id: string;
    };
}

@Component({
    selector: 'app-product-history-modal',
    standalone: true,
    imports: [CommonModule, TranslateModule, DatePipe, Button, Badge],
    templateUrl: './product-history-modal.html'
})
export class ProductHistoryModal implements OnChanges {
    @Input() visible = false;
    @Input() product: Product | null = null;
    @Output() close = new EventEmitter<void>();

    private productService = inject(ProductService);

    movements = signal<Movement[]>([]);
    isLoading = signal(false);

    ngOnChanges(changes: SimpleChanges) {
        if (changes['visible'] && this.visible && this.product) {
            this.loadHistory();
        } else if (!this.visible) {
            this.movements.set([]);
        }
    }

    loadHistory() {
        if (!this.product) return;
        this.isLoading.set(true);
        this.productService.getProductMovements(this.product.id)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (res) => {
                    this.movements.set(res || []);
                }
            });
    }

    onClose() {
        this.close.emit();
    }
}
