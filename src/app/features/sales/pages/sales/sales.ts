import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SalesService } from '../../services/sales.service';
import { finalize } from 'rxjs';
import { DataWarning } from '../../../../shared/components/data-warning/data-warning';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Modal } from '../../../../shared/components/modal/modal';
import { LucideAngularModule } from 'lucide-angular';
import { HotToastService } from '@ngxpert/hot-toast';

import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, DecimalPipe, DataWarning, EmptyState, Modal, Button, LucideAngularModule],
  templateUrl: './sales.html'
})
export class Sales {

  private salesService = inject(SalesService);
  private toast = inject(HotToastService);

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

  showWarning = signal(false);
  warningMessage = signal('¿Estás seguro que deseas anular esta venta? La acción generará movimientos de entrada y podría impactar las estadísticas de tu inventario.');
  saleToRevert = signal<any | null>(null);
  isReverting = signal(false);

  // Modal de detalles
  showDetailsModal = signal(false);
  selectedSaleDetail = signal<any | null>(null);
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
    setTimeout(() => this.selectedSaleDetail.set(null), 300); // clear after animation
  }

  triggerRevert(sale: any) {
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
