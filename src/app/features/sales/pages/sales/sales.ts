import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink, ActivatedRoute, Router, Params } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../services/sales.service';
import { Sale } from '../../../../core/models/sale.model';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DataWarning } from '../../../../shared/components/data-warning/data-warning';
import { Modal } from '../../../../shared/components/modal/modal';
import { LucideAngularModule } from 'lucide-angular';
import { HotToastService } from '@ngxpert/hot-toast';
import { TranslateService } from '@ngx-translate/core';
import { Button } from '../../../../shared/components/button/button';
import { Badge } from '../../../../shared/components/badge/badge';
import { TableComponent } from '../../../../shared/components/table/table';
import { SearchInput } from '../../../../shared/components/search-input/search-input';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';
import { PaginationMeta } from '../../../../core/models/pagination-meta.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule, RouterLink, DatePipe, CurrencyPipe,
    FormsModule, DataWarning, Modal, Button, Badge, LucideAngularModule,
    TableComponent, SearchInput, PaginationComponent
  ],
  templateUrl: './sales.html'
})
export class Sales implements OnInit {
  private workspaceContext = inject(WorkspaceContextService);
  private salesService = inject(SalesService);
  private route = inject(ActivatedRoute);
  public router = inject(Router); // Changed to public to use in template if needed, or we use a method
  private toast = inject(HotToastService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  onPageChange(newPage: number) {
    this.router.navigate([], {
      queryParams: { page: newPage },
      queryParamsHandling: 'merge'
    });
  }

  currency = computed(() => this.workspaceContext.currency);
  locale = computed(() => this.workspaceContext.locale);

  sales = signal<Sale[]>([]);
  meta = signal<PaginationMeta<Sale>['meta'] | null>(null);
  page = signal(1);
  loading = signal(true);
  
  searchQuery = '';

  ngOnInit() {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params: Params) => {
      this.searchQuery = params['search'] || '';
      this.page.set(Number(params['page']) || 1);
      this.loadSales();
    });
  }

  loadSales() {
    this.loading.set(true);

    this.salesService.findAll(this.page(), 10, this.searchQuery, 'ACTIVE')
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.sales.set(res.data);
          this.meta.set(res.meta);
        },
        error: (err) => {
          console.error(err);
          this.toast.error(this.translate.instant('TOAST.ERROR_LOADING_SALES'));
        }
      });
  }

  applyFilters() {
    this.router.navigate(['/sales'], {
      queryParams: {
        search: this.searchQuery || null,
        page: 1
      }
    });
  }

  clearFilter() {
    this.router.navigate(['/sales']);
  }

  nextPage() {
    if (this.meta() && this.page() < this.meta()!.totalPages) {
      this.router.navigate([], {
        queryParams: { page: this.page() + 1 },
        queryParamsHandling: 'merge'
      });
    }
  }

  prevPage() {
    if (this.page() > 1) {
      this.router.navigate([], {
        queryParams: { page: this.page() - 1 },
        queryParamsHandling: 'merge'
      });
    }
  }

  // Warning & Revert
  showWarning = signal(false);
  warningMessage = signal('¿Estás seguro que deseas anular esta venta? La acción generará movimientos de entrada y podría impactar las estadísticas de tu inventario.');
  saleToRevert = signal<Sale | null>(null);
  isReverting = signal(false);

  // Modal de detalles
  showDetailsModal = signal(false);
  selectedSaleDetail = signal<Sale | null>(null);
  isLoadingDetails = signal(false);

  viewDetails(saleId: string) {
    this.isLoadingDetails.set(true);
    this.showDetailsModal.set(true);

    this.salesService.findOne(saleId).pipe(
      finalize(() => this.isLoadingDetails.set(false))
    ).subscribe({
      next: (sale) => {
        this.selectedSaleDetail.set(sale);
      },
      error: (err) => {
        console.error('Error fetching sale details', err);
        this.toast.error(this.translate.instant('TOAST.ERROR_FETCHING_SALE'));
        this.closeDetailsModal();
      }
    });
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    setTimeout(() => this.selectedSaleDetail.set(null), 300);
  }

  triggerRevert(sale: Sale) {
    this.saleToRevert.set(sale);
    this.showWarning.set(true);
  }

  cancelRevert() {
    this.saleToRevert.set(null);
    this.showWarning.set(false);
  }

  confirmRevert() {
    const sale = this.saleToRevert();
    if (!sale) return;

    this.isReverting.set(true);
    this.salesService.remove(sale.id).pipe(
      this.toast.observe({
        loading: this.translate.instant('TOAST.REVERTING_SALE'),
        success: this.translate.instant('TOAST.SALE_REVERTED'),
        error: this.translate.instant('TOAST.ERROR_REVERTING_SALE')
      }),
      finalize(() => {
        this.isReverting.set(false);
        this.showWarning.set(false);
        this.saleToRevert.set(null);
      })
    ).subscribe({
      next: () => {
        this.loadSales();
      }
    });
  }
}
