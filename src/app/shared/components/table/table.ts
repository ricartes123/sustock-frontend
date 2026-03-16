import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmptyState } from '../empty-state/empty-state';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, EmptyState],
  templateUrl: './table.html'
})
export class TableComponent {
  @Input() isLoading: boolean = false;
  @Input() loadingText: string = 'Cargando...';
  
  @Input() isEmpty: boolean = false;
  @Input() emptyIcon: string = 'package-open';
  @Input() emptyTitle: string = '';
  @Input() emptyDescription: string = '';
  @Input() showEmptyAction: boolean = false;
}
