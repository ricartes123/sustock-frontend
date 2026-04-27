import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Movement } from '../../../../core/models/movement.model';
import { MovementService } from '../../services/movement.service';
import { PaginationMeta } from '../../../../core/models/pagination-meta.model';

import { TableComponent } from '../../../../shared/components/table/table';
import { Button } from '../../../../shared/components/button/button';
import { Badge } from '../../../../shared/components/badge/badge';
import { LucideAngularModule } from 'lucide-angular';
import { SearchInput } from '../../../../shared/components/search-input/search-input';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';
import { Modal } from '../../../../shared/components/modal/modal';

@Component({
  selector: 'app-movements',
  imports: [CommonModule, FormsModule, TranslateModule, TableComponent, Button, Badge, LucideAngularModule, SearchInput, Modal, CurrencyPipe],
  templateUrl: './movements.html',
  styleUrl: './movements.css',
})
export class Movements {
  private movementService = inject(MovementService);
  private workspaceContext = inject(WorkspaceContextService);

  currency = computed(() => this.workspaceContext.currency);
  locale = computed(() => this.workspaceContext.locale);

  movements = signal<Movement[]>([]);
  meta = signal<PaginationMeta<Movement>['meta'] | null>(null);
  page = signal(1);

  loading = signal(false);

  showDetailsModal = signal(false);
  selectedMovement = signal<Movement | null>(null);

  viewDetails(movement: Movement) {
    this.selectedMovement.set(movement);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    setTimeout(() => this.selectedMovement.set(null), 300);
  }

  searchQuery = '';
  selectedType = '';

  ngOnInit() {
    this.loadMovements();
  }

  loadMovements() {
    this.loading.set(true);

    this.movementService.getAll(
      this.workspaceContext.activeWorkspace()!.id,
      this.page(),
      10,
      this.selectedType || undefined,
    ).subscribe({
      next: (res) => {
        this.movements.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applyFilters() {
    this.page.set(1);
    this.loadMovements();
  }

  nextPage() {
    if (this.meta() && this.page() < this.meta()!.totalPages) {
      this.page.update(p => p + 1);
      this.loadMovements();
    }
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.loadMovements();
    }
  }
}

