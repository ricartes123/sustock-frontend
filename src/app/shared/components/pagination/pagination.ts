import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../button/button';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, Button, LucideAngularModule, TranslateModule],
  templateUrl: './pagination.html',
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalItems?: number;
  @Input() limit: number = 10;

  @Output() pageChange = new EventEmitter<number>();

  get from(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.limit + 1;
  }

  get to(): number {
    if (!this.totalItems) return this.currentPage * this.limit;
    return Math.min(this.currentPage * this.limit, this.totalItems);
  }

  get pages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 10) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    const start = Math.max(2, current - 5);
    const end = Math.min(total - 1, current + 5);

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < total - 1) {
      pages.push('...');
    }

    pages.push(total);

    return pages;
  }

  goToPage(page: number | string) {
    if (typeof page === 'number') {
      this.pageChange.emit(page);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }
}
