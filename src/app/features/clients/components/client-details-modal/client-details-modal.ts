import { Component, EventEmitter, Input, Output, inject, OnChanges, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { HotToastService } from '@ngxpert/hot-toast';
import { Button } from '../../../../shared/components/button/button';
import { Modal } from '../../../../shared/components/modal/modal';
import { Client } from '../../../../core/models/client.model';
import { ClientsService } from '../../services/clients.service';
import { Sale } from '../../../../core/models/sale.model';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';

@Component({
  selector: 'app-client-details-modal',
  standalone: true,
  imports: [CommonModule, Button, Modal, CurrencyPipe, DatePipe],
  templateUrl: './client-details-modal.html'
})
export class ClientDetailsModal implements OnChanges {
  @Input() visible = false;
  @Input() client: Client | null = null;
  @Output() close = new EventEmitter<void>();

  private clientsService = inject(ClientsService);
  private workspaceContext = inject(WorkspaceContextService);
  private toast = inject(HotToastService);
  private destroyRef = inject(DestroyRef);
  private salesRequest?: Subscription;

  sales = signal<Sale[]>([]);
  loadingSales = signal(false);

  // Quick stats
  totalSpent = signal(0);
  totalSales = signal(0);
  averageTicket = signal(0);

  // Pagination
  page = signal(1);
  totalPages = signal(1);

  get currency() {
    return this.workspaceContext.currency;
  }

  get locale() {
    return this.workspaceContext.locale;
  }

  ngOnChanges() {
    if (this.visible && this.client) {
      this.page.set(1);
      this.loadSales(this.client.id);
    } else {
      this.salesRequest?.unsubscribe();
      this.sales.set([]);
      this.totalSpent.set(0);
      this.totalSales.set(0);
      this.averageTicket.set(0);
    }
  }

  private loadSales(clientId: string) {
    this.salesRequest?.unsubscribe();
    this.loadingSales.set(true);
    this.salesRequest = this.clientsService.getClientSales(clientId, this.page())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.sales.set(response.data);
          this.totalSales.set(response.meta.total);
          this.totalSpent.set(response.meta.totalAmount);
          this.averageTicket.set(response.meta.averageTicket);
          this.totalPages.set(response.meta.totalPages);
          this.loadingSales.set(false);
        },
        error: () => {
          this.loadingSales.set(false);
          this.toast.error('No se pudieron cargar las ventas del cliente.');
        }
      });
  }

  nextPage() {
    if (this.page() < this.totalPages() && this.client) {
      this.page.update(p => p + 1);
      this.loadSales(this.client.id);
    }
  }

  prevPage() {
    if (this.page() > 1 && this.client) {
      this.page.update(p => p - 1);
      this.loadSales(this.client.id);
    }
  }
}
