import { Component, inject, signal } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';
import { Movement } from '../../../../core/models/movement.model';
import { MovementService } from '../../services/movement.service';
import { PaginationMeta } from '../../../../core/models/pagination-meta.model';

@Component({
  selector: 'app-movements',
  imports: [TranslateModule],
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
}
