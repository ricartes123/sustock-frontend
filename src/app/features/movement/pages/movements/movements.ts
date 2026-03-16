import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';
import { Movement } from '../../../../core/models/movement.model';
import { MovementService } from '../../services/movement.service';
import { PaginationMeta } from '../../../../core/models/pagination-meta.model';

import { TableComponent } from '../../../../shared/components/table/table';
import { Button } from '../../../../shared/components/button/button';
import { Badge } from '../../../../shared/components/badge/badge';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-movements',
  imports: [CommonModule, FormsModule, TranslateModule, TableComponent, Button, Badge, LucideAngularModule],
  templateUrl: './movements.html',
  styleUrl: './movements.css',
})
export class Movements {
  private workspaceContext = inject(WorkspaceContextService);
  private movementService = inject(MovementService);

  movements = signal<Movement[]>([]);
  meta = signal<PaginationMeta | null>(null);
  page = signal(1);

  loading = signal(false);

  searchQuery = '';

  ngOnInit() {
    this.loadMovements();
  }

  loadMovements() {
    this.loading.set(true);

    this.movementService.getAll(
      this.page(),
      10,
      this.searchQuery,
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

