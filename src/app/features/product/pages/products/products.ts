import { Component, inject, signal, computed } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { BusinessContextService } from '../../../../core/services/business-context.service';

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './products.html',
})
export class Products {
  private businessContext = inject(BusinessContextService);
  private productService = inject(ProductService);

  currency = computed(() => this.businessContext.currency);
  products = signal<Product[]>([]);
  meta = signal<any>(null);
  page = signal(1);
  loading = signal(true);

  loadProducts() {
    this.loading.set(true);

    this.productService.getAll(this.page()).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  nextPage() {
    if (this.page() < this.meta().totalPages) {
      this.page.update(p => p + 1);
      this.loadProducts();
    }
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.loadProducts();
    }
  }

  get locale() {
    return this.businessContext.locale;
  }
}