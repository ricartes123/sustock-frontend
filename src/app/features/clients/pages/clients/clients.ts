import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

// Feature components
import { TableComponent } from '../../../../shared/components/table/table';
import { SearchInput } from '../../../../shared/components/search-input/search-input';
import { Button } from '../../../../shared/components/button/button';
import { Badge } from '../../../../shared/components/badge/badge';
import { LucideAngularModule } from 'lucide-angular';
import { DataWarning } from '../../../../shared/components/data-warning/data-warning';

// Models and Services
import { Client } from '../../../../core/models/client.model';
import { PaginationMeta } from '../../../../core/models/pagination-meta.model';
import { ClientsService } from '../../services/clients.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { TranslateService } from '@ngx-translate/core';

import { ClientFormModal } from '../../components/client-form-modal/client-form-modal';
import { ClientDetailsModal } from '../../components/client-details-modal/client-details-modal';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterModule,
    TableComponent,
    SearchInput,
    Button,
    Badge,
    LucideAngularModule,
    DataWarning,
    ClientFormModal,
    ClientDetailsModal,
    PaginationComponent
  ],
  templateUrl: './clients.html'
})
export class ClientsComponent implements OnInit {
  private clientsService = inject(ClientsService);
  private toastService = inject(HotToastService);
  private translate = inject(TranslateService);

  // State
  clients = signal<Client[]>([]);
  meta = signal<PaginationMeta<Client>['meta'] | null>(null);
  page = signal<number>(1);
  limit = signal<number>(7);
  loading = signal<boolean>(true);

  searchQuery: string = '';
  statusFilter: 'ALL' | 'ACTIVE' | 'ARCHIVED' = 'ACTIVE';

  // Archiving
  isArchiveWarningOpen = signal<boolean>(false);
  isArchiving = signal<boolean>(false);
  clientToArchive = signal<Client | null>(null);

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.loading.set(true);
    const backendStatus = this.statusFilter === 'ARCHIVED' ? 'INACTIVE' : this.statusFilter;
    
    this.clientsService.findAll(
      this.page(),
      this.limit(),
      this.searchQuery,
      backendStatus
    ).subscribe({
      next: (res) => {
        this.clients.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading clients', err);
        this.toastService.error(this.translate.instant('TOAST.ERROR_LOADING_CLIENTS'));
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    this.page.set(1);
    this.loadClients();
  }

  clearFilter() {
    this.searchQuery = '';
    this.statusFilter = 'ACTIVE';
    this.applyFilters();
  }

  nextPage() {
    if (this.meta() && this.page() < this.meta()!.totalPages) {
      this.page.update(p => p + 1);
      this.loadClients();
    }
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.loadClients();
    }
  }

  getWhatsAppLink(client: Client): string {
    if (!client.phone) return '';
    const cleanPhone = client.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}`;
  }

  openWhatsApp(client: Client) {
    if (!client.phone) return;
    window.open(this.getWhatsAppLink(client), '_blank');
  }

  openCreateModal() {
    this.clientToEdit.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(client: Client) {
    this.clientToEdit.set(client);
    this.isFormModalOpen.set(true);
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
    this.clientToEdit.set(null);
  }

  onSaveClient() {
    this.loadClients();
    this.closeFormModal();
  }

  openDetailsModal(client: Client) {
    this.clientForDetails.set(client);
    this.isDetailsModalOpen.set(true);
  }

  closeDetailsModal() {
    this.isDetailsModalOpen.set(false);
    this.clientForDetails.set(null);
  }

  // Modals State
  isFormModalOpen = signal(false);
  clientToEdit = signal<Client | null>(null);

  isDetailsModalOpen = signal(false);
  clientForDetails = signal<Client | null>(null);

  // Archiving
  toggleClientStatus(client: Client) {
    if (client.isActive !== false) {
      this.clientToArchive.set(client);
      this.isArchiveWarningOpen.set(true);
    } else {
      // Restore directly
      this.clientsService.restore(client.id).subscribe({
        next: () => {
          this.toastService.success(this.translate.instant('TOAST.CLIENT_RESTORED'));
          this.loadClients();
        },
        error: () => this.toastService.error(this.translate.instant('TOAST.ERROR_RESTORING_CLIENT'))
      });
    }
  }

  confirmArchive() {
    const client = this.clientToArchive();
    if (!client) return;

    this.isArchiving.set(true);
    this.clientsService.remove(client.id).subscribe({
      next: () => {
        this.toastService.success(this.translate.instant('TOAST.CLIENT_ARCHIVED'));
        this.isArchiving.set(false);
        this.closeArchiveWarning();
        this.loadClients();
      },
      error: () => {
        this.toastService.error(this.translate.instant('TOAST.ERROR_ARCHIVING_CLIENT'));
        this.isArchiving.set(false);
        this.closeArchiveWarning();
      }
    });
  }

  closeArchiveWarning() {
    this.isArchiveWarningOpen.set(false);
    this.clientToArchive.set(null);
  }
}
