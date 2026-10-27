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
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../../features/product/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { ClientsService } from '../../../../features/clients/services/clients.service';
import { Client } from '../../../../core/models/client.model';
import { SalesService } from '../../services/sales.service';
import { DataWarning } from '../../../../shared/components/data-warning/data-warning';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { HotToastService } from '@ngxpert/hot-toast';
import { Button } from '../../../../shared/components/button/button';

type SaleItemForm = FormGroup<{
  productId: FormControl<string>;
  quantity: FormControl<number>;
  unitPrice: FormControl<number>;
}>;

// Money is summed in integer cents to avoid floating-point drift (0.1 + 0.2)
const toCents = (amount: number | string | null) => Math.round(Number(amount ?? 0) * 100);

@Component({
  selector: 'app-sale-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataWarning, DecimalPipe, Button],
  templateUrl: './sale-create.html',
})
export class SaleCreate {

  private fb = inject(NonNullableFormBuilder);
  private productService = inject(ProductService);
  private clientsService = inject(ClientsService);
  private salesService = inject(SalesService);
  private router = inject(Router);
  private toast = inject(HotToastService);

  // ─────────────────────────────
  // Form state
  // ─────────────────────────────

  clients = signal<Client[]>([]);
  clientControl = this.fb.control('');

  searchControl = this.fb.control('');
  searchResults = signal<Product[]>([]);
  isSearching = signal(false);
  showDropdown = signal(false);

  items = this.fb.array<SaleItemForm>([]);
  products = signal<Record<string, Product>>({});

  itemsValue = toSignal(
    this.items.valueChanges.pipe(map(() => this.items.getRawValue())),
    { initialValue: [] as ReturnType<typeof this.items.getRawValue> }
  );

  showWarning = signal(false);
  warningMessage = signal('');

  isSubmitting = signal(false);

  // ─────────────────────────────
  // Computed
  // ─────────────────────────────

  totalAmount = computed(() =>
    this.itemsValue().reduce((sum, item) => sum + toCents(item.unitPrice) * (item.quantity ?? 0), 0) / 100
  );

  totalDiscount = computed(() =>
    this.itemsValue().reduce((sum, item) => {
      const product = this.products()[item.productId];
      if (!product) return sum;
      const discountCents = Math.max(0, toCents(product.price) - toCents(item.unitPrice));
      return sum + discountCents * (item.quantity ?? 0);
    }, 0) / 100
  );

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
    this.searchControl.valueChanges.pipe(
      tap(query => {
        this.showDropdown.set(query.length >= 2);
        if (query.length < 2) this.searchResults.set([]);
      }),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) return of(null);

        this.isSearching.set(true);
        return this.productService.getAll(1, 10, query, false, 'ACTIVE').pipe(
          catchError(() => {
            this.toast.error('No se pudieron buscar productos.');
            return of(null);
          }),
          finalize(() => this.isSearching.set(false))
        );
      }),
      takeUntilDestroyed()
    ).subscribe(res => {
      if (res) this.searchResults.set(res.data);
    });
  }

  private loadClients() {
    this.clientsService.findAll(1, 1000, '', 'ACTIVE')
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: res => this.clients.set(res.data),
        error: () => this.toast.error('No se pudieron cargar los clientes.')
      });
  }

  // ─────────────────────────────
  // Search
  // ─────────────────────────────

  onSearchFocus() {
    if (this.searchControl.value.length >= 2) {
      this.showDropdown.set(true);
    }
  }

  clearSearch() {
    this.searchControl.setValue('');
  }

  selectProduct(product: Product) {
    this.showDropdown.set(false);
    this.searchResults.set([]);
    this.searchControl.setValue('', { emitEvent: false });

    const existing = this.items.controls.find(group => group.controls.productId.value === product.id);
    if (existing) {
      existing.controls.quantity.setValue((existing.controls.quantity.value ?? 0) + 1);
      return;
    }

    const listPrice = Number(product.price);
    this.products.update(products => ({ ...products, [product.id]: product }));
    this.items.push(this.fb.group({
      productId: this.fb.control(product.id),
      quantity: this.fb.control(1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]),
      // Discounts only: the backend rejects prices above the list price
      unitPrice: this.fb.control(listPrice, [Validators.required, Validators.min(0), Validators.max(listPrice)]),
    }));
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  roundUnitPrice(group: SaleItemForm) {
    const price = group.controls.unitPrice.value;
    if (price !== null) {
      group.controls.unitPrice.setValue(toCents(price) / 100);
    }
  }

  isDiscounted(group: SaleItemForm): boolean {
    const product = this.products()[group.controls.productId.value];
    return !!product && toCents(group.controls.unitPrice.value) < toCents(product.price);
  }

  lineTotal(group: SaleItemForm): number {
    return toCents(group.controls.unitPrice.value) * (group.controls.quantity.value ?? 0) / 100;
  }

  // ─────────────────────────────
  // Submit
  // ─────────────────────────────

  confirmSale() {
    if (this.items.length === 0) return;

    if (this.items.invalid) {
      this.items.markAllAsTouched();
      this.toast.error('Revisá cantidades y precios: el precio no puede superar el de lista.');
      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      clientId: this.clientControl.value || undefined,
      items: this.items.getRawValue().map(item => {
        const unitCents = toCents(item.unitPrice);
        const listCents = toCents(this.products()[item.productId].price);
        return {
          productId: item.productId,
          quantity: item.quantity,
          ...(unitCents !== listCents ? { unitPrice: unitCents / 100 } : {})
        };
      })
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
