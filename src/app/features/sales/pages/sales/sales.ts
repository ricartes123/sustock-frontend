import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SalesService } from '../../services/sales.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './sales.html'
})
export class Sales {

  private salesService = inject(SalesService);

  sales = signal<any[]>([]);
  loading = signal(true);

  constructor() {
    this.loadSales();
  }

  loadSales() {
    this.loading.set(true);

    this.salesService.findAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(res => {
        const data = res;
        this.sales.set(Array.isArray(data) ? data : []);
      });
  }
}