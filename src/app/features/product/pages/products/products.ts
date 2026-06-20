import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../../../core/models/product.model';
import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductForm } from '../../components/product-form/product-form';

import { Button } from '../../../../shared/components/button/button';
import { Badge } from '../../../../shared/components/badge/badge';
import { LucideAngularModule } from 'lucide-angular';
import { HotToastService } from '@ngxpert/hot-toast';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { DataWarning } from '../../../../shared/components/data-warning/data-warning';
import { QuickStockModal } from '../../components/quick-stock-modal/quick-stock-modal';
import { ProductHistoryModal } from '../../components/product-history-modal/product-history-modal';
import { ImportModal } from '../../components/import-modal/import-modal';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaginationMeta } from '../../../../core/models/pagination-meta.model';
import { TableComponent } from '../../../../shared/components/table/table';
import { SearchInput } from '../../../../shared/components/search-input/search-input';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [
    CurrencyPipe,
    DatePipe,
    UpperCasePipe,
    FormsModule,
    ProductForm,
    TranslateModule,
    Button,
    Badge,
    LucideAngularModule,
    DataWarning,
    QuickStockModal,
    ProductHistoryModal,
    ImportModal,
    TableComponent,
    SearchInput,
    PaginationComponent,
  ],
  templateUrl: './products.html',
})
export class Products implements OnInit {
  private workspaceContext = inject(WorkspaceContextService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(HotToastService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  currency = computed(() => this.workspaceContext.currency);
  isAdmin = computed(() => this.workspaceContext.isAdmin());

  products = signal<Product[]>([]);
  meta = signal<PaginationMeta<Product>['meta'] | null>(null);
  page = signal(1);
  limit = signal(7);
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

  // Archive Warning State
  isArchiveWarningOpen = signal(false);
  productToArchive = signal<Product | null>(null);
  isArchiving = signal(false);

  // Quick Stock State
  isQuickStockModalOpen = signal(false);
  productForQuickStock = signal<Product | null>(null);

  openQuickStockForProduct(product: Product) {
    this.productForQuickStock.set(product);
    this.isQuickStockModalOpen.set(true);
  }

  // History State
  isHistoryModalOpen = signal(false);
  productForHistory = signal<Product | null>(null);

  // Import State
  isImportModalOpen = signal(false);

  loadProducts() {
    this.loading.set(true);

    this.productService.getAll(
      this.page(),
      this.limit(),
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
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params: Params) => {
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

      if (params['action'] === 'quick-stock') {
        this.isQuickStockModalOpen.set(true);
      } else if (params['action'] === 'new') {
        this.openCreateModal();
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
    if (this.meta() && this.page() < this.meta()!.totalPages) {
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

    if (product.isActive) {
      this.productToArchive.set(product);
      this.isArchiveWarningOpen.set(true);
    } else {
      this.executeToggleStatus(product);
    }
  }

  confirmArchive() {
    const product = this.productToArchive();
    if (product) {
      this.isArchiving.set(true);
      this.executeToggleStatus(product);
    }
  }

  closeArchiveWarning() {
    this.isArchiveWarningOpen.set(false);
    this.productToArchive.set(null);
    this.isArchiving.set(false);
  }

  executeToggleStatus(product: Product) {
    const newStatus = !product.isActive;
    this.productService.toggleStatus(product.id, newStatus).pipe(
      this.toast.observe({
        loading: this.translate.instant('TOAST.UPDATING_STATUS'),
        success: this.translate.instant('TOAST.STATUS_UPDATED'),
        error: this.translate.instant('TOAST.ERROR_UPDATING_STATUS')
      }),
      finalize(() => {
        if (!newStatus) {
          this.closeArchiveWarning();
        }
      })
    ).subscribe(() => {
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

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { action: null },
      queryParamsHandling: 'merge'
    });
  }

  closeQuickStockModal(success: boolean) {
    this.isQuickStockModalOpen.set(false);
    this.productForQuickStock.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { action: null },
      queryParamsHandling: 'merge'
    });

    if (success) {
      this.loadProducts();
    }
  }

  openHistoryModal(product: Product) {
    this.productForHistory.set(product);
    this.isHistoryModalOpen.set(true);
  }

  closeHistoryModal() {
    this.isHistoryModalOpen.set(false);
    this.productForHistory.set(null);
  }

  closeImportModal(imported: boolean) {
    this.isImportModalOpen.set(false);
    if (imported) this.loadProducts();
  }

  handleSaveProduct(payload: { id?: string; data: Partial<Product> }) {
    this.isSaving.set(true);

    const request$ = payload.id
      ? this.productService.update(payload.id, payload.data)
      : this.productService.create(payload.data);

    request$.pipe(
      this.toast.observe({
        loading: payload.id
          ? this.translate.instant('TOAST.UPDATING_PRODUCT')
          : this.translate.instant('TOAST.CREATING_PRODUCT'),
        success: payload.id
          ? this.translate.instant('TOAST.PRODUCT_UPDATED')
          : this.translate.instant('TOAST.PRODUCT_CREATED'),
        error: this.translate.instant('TOAST.ERROR_SAVING_PRODUCT')
      }),
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: () => {
        this.closeModal();
        this.loadProducts();
      }
    });
  }
}