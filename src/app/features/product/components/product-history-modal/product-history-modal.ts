import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../../../core/models/product.model';
import { Button } from '../../../../shared/components/button/button';
import { Badge } from '../../../../shared/components/badge/badge';
import { finalize } from 'rxjs';
import { Movement } from '../../../../core/models/movement.model';
import { MovementService } from '../../../movement/services/movement.service';
import { PaginationMeta } from '../../../../core/models/pagination-meta.model';
import { Modal } from '../../../../shared/components/modal/modal';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
    selector: 'app-product-history-modal',
    standalone: true,
    imports: [
        CommonModule,
        DatePipe,
        Button,
        Badge,
        Modal,
        PaginationComponent
    ],
    templateUrl: './product-history-modal.html'
})
export class ProductHistoryModal implements OnChanges {
    @Input() visible = false;
    @Input() product: Product | null = null;
    @Output() close = new EventEmitter<void>();

    private productService = inject(ProductService);
    private movementsService = inject(MovementService);
    private toast = inject(HotToastService);

    meta = signal<PaginationMeta<Movement>['meta'] | null>(null);
    movements = signal<Movement[]>([]);
    page = signal(1);
    limit = signal(7);
    isLoading = signal(false);

    ngOnChanges(changes: SimpleChanges) {
        if (changes['visible'] && this.visible && this.product) {
            this.page.set(1);
            this.loadHistory();
        } else if (!this.visible) {
            this.movements.set([]);
        }
    }

    loadHistory() {
        if (!this.product) return;
        this.isLoading.set(true);
        this.movementsService.getProductMovements(this.product.id, this.page(), this.limit())
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (res) => {
                    this.movements.set(res.data || []);
                    this.meta.set(res.meta);
                },
                error: () => this.toast.error('No se pudo cargar el historial del producto.')
            });
    }

    onClose() {
        this.close.emit();
    }
}
