import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductForm } from '../../components/product-form/product-form';

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CurrencyPipe, DatePipe, FormsModule, ProductForm],
  templateUrl: './products.html',
})
export class Products implements OnInit {
  private workspaceContext = inject(WorkspaceContextService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  currency = computed(() => this.workspaceContext.currency);
  isAdmin = computed(() => this.workspaceContext.isAdmin());

  products = signal<Product[]>([]);
  meta = signal<any>(null);
  page = signal(1);
  loading = signal(true);
  isLowStockFilter = signal<boolean>(false);
  currentStatusFilter = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE');

  searchQuery = '';
  stockFilter = 'ALL';
  formStatusFilter = 'ACTIVE';

  // Modal State
  isModalOpen = signal(false);
  productToEdit = signal<Product | null>(null);
  isSaving = signal(false);

  loadProducts() {
    this.loading.set(true);

    this.productService.getAll(
      this.page(),
      10,
      this.searchQuery,
      this.isLowStockFilter(),
      this.currentStatusFilter()
    ).subscribe({
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

      const status = params['status'];
      if (status === 'INACTIVE' || status === 'ALL' || status === 'ACTIVE') {
        this.currentStatusFilter.set(status);
        this.formStatusFilter = status;
      } else {
        this.currentStatusFilter.set('ACTIVE');
        this.formStatusFilter = 'ACTIVE';
      }

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
        lowStock: this.stockFilter === 'LOW_STOCK' ? 'true' : null,
        status: this.formStatusFilter === 'ACTIVE' ? null : this.formStatusFilter
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
    return this.workspaceContext.locale;
  }

  clearFilter() {
    this.router.navigate(['/products']);
  }

  toggleProductStatus(product: Product) {
    if (!this.isAdmin()) return;

    const newStatus = !product.isActive;
    this.productService.toggleStatus(product.id, newStatus).subscribe(() => {
      this.loadProducts();
    });
  }

  openCreateModal() {
    this.productToEdit.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(product: Product) {
    this.productToEdit.set(product);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.productToEdit.set(null);
  }

  handleSaveProduct(payload: { id?: string; data: Partial<Product> }) {
    this.isSaving.set(true);

    const request$ = payload.id
      ? this.productService.update(payload.id, payload.data)
      : this.productService.create(payload.data);

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeModal();
        this.loadProducts();
      },
      error: () => {
        this.isSaving.set(false);
        // Error handling visual (por consola momentaneamente o notificaciones)
        console.error('Failed to save product');
      }
    });
  }
}