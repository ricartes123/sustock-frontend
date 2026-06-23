import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pagination.html',
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  private _totalPages: number = 1;

  @Input()
  get totalPages(): number {
    if (this.totalItems !== undefined && this.limit) {
      return Math.ceil(this.totalItems / this.limit) || 1;
    }
    return this._totalPages;
  }

  set totalPages(value: number) {
    this._totalPages = value;
  }
  @Input() totalItems?: number;
  @Input() limit: number = 10;
  @Input() maxVisiblePages?: number;
  @Input() pageRange?: number;

  @Output() pageChange = new EventEmitter<number>();

  get computedMaxVisiblePages(): number {
    return this.maxVisiblePages ?? Math.max(5, this.limit);
  }

  get computedPageRange(): number {
    return this.pageRange ?? Math.max(2, Math.floor(this.computedMaxVisiblePages / 2));
  }

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

    if (total <= this.computedMaxVisiblePages) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    const start = Math.max(2, current - this.computedPageRange);
    const end = Math.min(total - 1, current + this.computedPageRange);

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
