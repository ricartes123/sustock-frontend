import {
  Component,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
  HostListener
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../../features/product/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { ClientsService } from '../../../../features/clients/services/clients.service';
import { Client } from '../../../../core/models/client.model';
import { SalesService } from '../../services/sales.service';
import { DataWarning } from '../../../../shared/components/data-warning/data-warning';
import { Subject, debounceTime, distinctUntilChanged, switchMap, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HotToastService } from '@ngxpert/hot-toast';
import { Button } from '../../../../shared/components/button/button';

interface SaleItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

@Component({
  selector: 'app-sale-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DataWarning, DecimalPipe, Button],
  templateUrl: './sale-create.html',
})
export class SaleCreate {

  private productService = inject(ProductService);
  private clientsService = inject(ClientsService);
  private salesService = inject(SalesService);
  private router = inject(Router);
  private toast = inject(HotToastService);

  // ─────────────────────────────
  // Signals
  // ─────────────────────────────

  clients = signal<Client[]>([]);
  selectedClientId = signal<string>('');

  searchQuery = signal('');
  searchResults = signal<Product[]>([]);
  isSearching = signal(false);
  showDropdown = signal(false);

  items = signal<SaleItem[]>([]);

  showWarning = signal(false);
  warningMessage = signal('');

  isSubmitting = signal(false);

  // ─────────────────────────────
  // Computed
  // ─────────────────────────────

  totalAmount = computed(() =>
    this.items().reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  );

  totalDiscount = computed(() =>
    this.items().reduce(
      (sum, item) => sum + (Number(item.product.price) - item.unitPrice) * item.quantity,
      0
    )
  );

  // ─────────────────────────────
  // Search Subject
  // ─────────────────────────────

  private searchSubject = new Subject<string>();

  @ViewChild('searchContainer') searchContainer!: ElementRef;

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.searchContainer &&
      !this.searchContainer.nativeElement.contains(event.target)) {
      this.showDropdown.set(false);
    }
  }

  constructor() {
    this.loadClients();
    this.setupSearch();
  }

  // ─────────────────────────────
  // Init logic
  // ─────────────────────────────

  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        this.isSearching.set(true);
        return this.productService.getAll(1, 10, query, false, 'ACTIVE');
      }),
      takeUntilDestroyed()
    ).subscribe({
      next: res => {
        this.searchResults.set(res.data);
        this.isSearching.set(false);
      },
      error: () => this.isSearching.set(false)
    });
  }

  private loadClients() {
    this.clientsService.findAll(1, 1000, '', 'ACTIVE')
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: res => this.clients.set(res.data),
        error: () => {}
      });
  }

  // ─────────────────────────────
  // Search
  // ─────────────────────────────

  onSearchChange(query: string) {
    this.searchQuery.set(query);

    if (query.length >= 2) {
      this.showDropdown.set(true);
      this.searchSubject.next(query);
    } else {
      this.searchResults.set([]);
      this.showDropdown.set(false);
    }
  }

  selectProduct(product: Product) {
    this.showDropdown.set(false);
    this.searchQuery.set('');
    this.searchResults.set([]);

    this.items.update(current => {
      const existing = current.find(i => i.product.id === product.id);

      if (existing) {
        return current.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...current, { product, quantity: 1, unitPrice: Number(product.price) }];
    });
  }

  removeItem(index: number) {
    this.items.update(current =>
      current.filter((_, i) => i !== index)
    );
  }

  updateQuantity(index: number, qty: number) {
    this.items.update(current =>
      current.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(1, qty || 1) } : item
      )
    );
  }

  updateUnitPrice(index: number, price: number) {
    this.items.update(current =>
      current.map((item, i) =>
        i === index ? { ...item, unitPrice: Math.max(0, price || 0) } : item
      )
    );
  }

  // ─────────────────────────────
  // Submit
  // ─────────────────────────────

  confirmSale() {
    if (this.items().length === 0) return;

    this.isSubmitting.set(true);

    const payload = {
      clientId: this.selectedClientId() || undefined,
      items: this.items().map(i => ({
        productId: i.product.id,
        quantity: i.quantity,
        ...(i.unitPrice !== Number(i.product.price) ? { unitPrice: i.unitPrice } : {})
      }))
    };

    this.salesService.create(payload).pipe(
      this.toast.observe({
        loading: 'Registrando venta...',
        success: '¡Venta registrada exitosamente!',
        error: (e: unknown) => {
          const err = e as { error?: { message?: string } };
          if (err.error?.message?.includes('Stock insuficiente')) {
            return 'Advertencia de inventario';
          }
          return 'Error al registrar la venta';
        }
      }),
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: () => {
        this.router.navigate(['/sales']);
      },
      error: (err) => {
        if (err.error?.message?.includes('Stock insuficiente')) {
          this.warningMessage.set(err.error.message);
          this.showWarning.set(true);
        }
      }
    });
  }

  onWarningCancel() {
    this.showWarning.set(false);
  }

  onWarningConfirm() {
    this.showWarning.set(false);
  }
}