import { Component, EventEmitter, Input, Output, inject, OnChanges } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from '../../../../shared/components/button/button';
import { Modal } from '../../../../shared/components/modal/modal';
import { Client } from '../../../../core/models/client.model';
import { ClientsService } from '../../services/clients.service';
import { Sale } from '../../../../core/models/sale.model';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';

@Component({
  selector: 'app-client-details-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule, Button, Modal, CurrencyPipe, DatePipe],
  templateUrl: './client-details-modal.html'
})
export class ClientDetailsModal implements OnChanges {
  @Input() visible = false;
  @Input() client: Client | null = null;
  @Output() close = new EventEmitter<void>();

  private clientsService = inject(ClientsService);
  private workspaceContext = inject(WorkspaceContextService);

  sales: Sale[] = [];
  loadingSales = false;
  
  // Quick stats
  totalSpent = 0;
  totalSales = 0;
  averageTicket = 0;
  
  // Pagination
  page = 1;
  totalPages = 1;

  get currency() {
    return this.workspaceContext.currency;
  }

  get locale() {
    return this.workspaceContext.locale;
  }

  ngOnChanges() {
    if (this.visible && this.client) {
      this.page = 1;
      this.loadSales(this.client.id);
    } else {
      this.sales = [];
      this.totalSpent = 0;
      this.totalSales = 0;
      this.averageTicket = 0;
    }
  }

  private loadSales(clientId: string) {
    this.loadingSales = true;
    this.clientsService.getClientSales(clientId, this.page).subscribe({
      next: (response) => {
        this.sales = response.data;
        this.totalSales = response.meta.total;
        this.totalSpent = response.meta.totalAmount;
        this.averageTicket = response.meta.averageTicket;
        this.totalPages = response.meta.totalPages;
        this.loadingSales = false;
      },
      error: () => {
        this.loadingSales = false;
      }
    });
  }

  nextPage() {
    if (this.page < this.totalPages && this.client) {
        this.page++;
        this.loadSales(this.client.id);
    }
  }

  prevPage() {
    if (this.page > 1 && this.client) {
        this.page--;
        this.loadSales(this.client.id);
    }
  }
}
