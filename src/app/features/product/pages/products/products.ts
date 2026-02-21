import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { BusinessContextService } from '../../../../core/services/business-context.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './products.html',
})
export class Products implements OnInit {
  private businessContext = inject(BusinessContextService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  currency = computed(() => this.businessContext.currency);
  products = signal<Product[]>([]);
  meta = signal<any>(null);
  page = signal(1);
  loading = signal(true);
  isLowStockFilter = signal<boolean>(false);

  searchQuery = '';
  stockFilter = 'ALL';

  loadProducts() {
    this.loading.set(true);

    this.productService.getAll(this.page(), 10, this.searchQuery, this.isLowStockFilter()).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';

      if (params['lowStock'] === 'true') {
        this.isLowStockFilter.set(true);
        this.stockFilter = 'LOW_STOCK';
      } else {
        this.isLowStockFilter.set(false);
        this.stockFilter = 'ALL';
      }
      this.page.set(1);
      this.loadProducts();
    });
  }

  applyFilters() {
    this.router.navigate(['/products'], {
      queryParams: {
        search: this.searchQuery || null,
        lowStock: this.stockFilter === 'LOW_STOCK' ? 'true' : null
      }
    });
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

  clearFilter() {
    this.router.navigate(['/products']);
  }
}