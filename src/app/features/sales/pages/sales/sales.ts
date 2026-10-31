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
  private destroyRef = inject(DestroyRef);


  hasActiveFilters(): boolean {
    return !!this.startDate || !!this.endDate || this.minAmount !== null || this.maxAmount !== null || this.statusFilter !== 'ALL';
  }

  onPageChange(newPage: number) {
    this.router.navigate([], {
      queryParams: { page: newPage },
      queryParamsHandling: 'merge'
    });
  }

  currency = computed(() => this.workspaceContext.currency);
  locale = computed(() => this.workspaceContext.locale);
  isAdmin = computed(() => this.workspaceContext.isAdmin());

  sales = signal<Sale[]>([]);
  meta = signal<PaginationMeta<Sale>['meta'] | null>(null);
  page = signal(1);
  limit = signal(7);
  loading = signal(true);
  
  searchQuery = '';
  statusFilter = 'ALL';
  startDate = '';
  endDate = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  minAmountFormatted = '';
  maxAmountFormatted = '';

  openDatePicker(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch {
        // Fallback silenciado
      }
    }
  }

  onAmountInput(field: 'min' | 'max', event: Event) {
    const input = event.target as HTMLInputElement;
    const cleanValue = input.value.replace(/\D/g, '');
    const formatted = cleanValue ? Number(cleanValue).toLocaleString('es-AR') : '';
    
    if (field === 'min') {
      this.minAmountFormatted = formatted;
      this.minAmount = cleanValue ? Number(cleanValue) : null;
    } else {
      this.maxAmountFormatted = formatted;
      this.maxAmount = cleanValue ? Number(cleanValue) : null;
    }
    input.value = formatted;
  }

  ngOnInit() {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params: Params) => {
      this.searchQuery = params['search'] || '';
      this.statusFilter = params['status'] || 'ALL';
      this.startDate = params['startDate'] || '';
      this.endDate = params['endDate'] || '';
      this.minAmount = params['minAmount'] !== undefined && params['minAmount'] !== '' ? Number(params['minAmount']) : null;
      this.maxAmount = params['maxAmount'] !== undefined && params['maxAmount'] !== '' ? Number(params['maxAmount']) : null;
      this.minAmountFormatted = this.minAmount !== null ? this.minAmount.toLocaleString('es-AR') : '';
      this.maxAmountFormatted = this.maxAmount !== null ? this.maxAmount.toLocaleString('es-AR') : '';
      this.page.set(Number(params['page']) || 1);
      this.loadSales();
    });
  }

  loadSales() {
    this.loading.set(true);

    this.salesService.findAll(
      this.page(),
      this.limit(),
      this.searchQuery,
      this.statusFilter,
      this.startDate || undefined,
      this.endDate || undefined,
      this.minAmount !== null ? this.minAmount : undefined,
      this.maxAmount !== null ? this.maxAmount : undefined
    )
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.sales.set(res.data);
          this.meta.set(res.meta);
        },
        error: (err) => {
          console.error(err);
          this.toast.error('Error al cargar ventas');
        }
      });
  }

  applyFilters() {
    this.router.navigate(['/sales'], {
      queryParams: {
        search: this.searchQuery || null,
        status: this.statusFilter !== 'ALL' ? this.statusFilter : null,
        startDate: this.startDate || null,
        endDate: this.endDate || null,
        minAmount: this.minAmount !== null && this.minAmount !== undefined ? this.minAmount : null,
        maxAmount: this.maxAmount !== null && this.maxAmount !== undefined ? this.maxAmount : null,
        page: 1
      }
    });
  }

  clearFilter() {
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.startDate = '';
    this.endDate = '';
    this.minAmount = null;
    this.maxAmount = null;
    this.minAmountFormatted = '';
    this.maxAmountFormatted = '';
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
        this.toast.error('Hubo un error al obtener los detalles de la venta.');
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
        loading: 'Anulando venta...',
        success: 'Venta anulada correctamente',
        error: 'Hubo un problema al anular la venta.'
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
