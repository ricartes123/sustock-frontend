import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { of, throwError } from 'rxjs';
import { SaleCreate } from './sale-create';
import { ProductService } from '../../../product/services/product.service';
import { ClientsService } from '../../../clients/services/clients.service';
import { SalesService } from '../../services/sales.service';
import { Product } from '../../../../core/models/product.model';

const product = (id: string, price: number): Product => ({
  id, name: id, price, costPrice: 0, stock: 10, stockMin: 0,
  isActive: true, workspaceId: 'w1', createdAt: '', updatedAt: '',
});

describe('SaleCreate', () => {
  const productService = { getAll: vi.fn() };
  const clientsService = { findAll: vi.fn() };
  const salesService = { create: vi.fn() };
  const router = { navigate: vi.fn() };
  const toast = { error: vi.fn(), observe: vi.fn(() => (source: unknown) => source) };
  let component: SaleCreate;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: ClientsService, useValue: clientsService },
        { provide: SalesService, useValue: salesService },
        { provide: Router, useValue: router },
        { provide: HotToastService, useValue: toast },
      ],
    });
    component = TestBed.runInInjectionContext(() => new SaleCreate());
  });

  it('adds a product at its list price and increments it when selected again', () => {
    component.selectProduct(product('p1', 100));
    component.selectProduct(product('p1', 100));

    expect(component.items.getRawValue()).toEqual([{ productId: 'p1', quantity: 2, unitPrice: 100 }]);
  });

  it('sums totals in cents without floating-point drift', () => {
    component.selectProduct(product('p1', 0.1));
    component.selectProduct(product('p2', 0.2));

    expect(component.totalAmount()).toBe(0.3);
  });

  it('computes the discount against the list price', () => {
    component.selectProduct(product('p1', 100));
    const line = component.items.at(0);
    line.controls.quantity.setValue(3);
    line.controls.unitPrice.setValue(90.5);

    expect(component.totalAmount()).toBe(271.5);
    expect(component.totalDiscount()).toBe(28.5);
    expect(component.isDiscounted(line)).toBe(true);
  });

  it('sends unitPrice only for discounted lines and navigates to the list', () => {
    salesService.create.mockReturnValue(of({ id: 's1' }));
    component.selectProduct(product('p1', 100));
    component.selectProduct(product('p2', 50));
    component.items.at(1).controls.unitPrice.setValue(45);
    component.clientControl.setValue('c1');

    component.confirmSale();

    expect(salesService.create).toHaveBeenCalledWith({
      clientId: 'c1',
      items: [
        { productId: 'p1', quantity: 1 },
        { productId: 'p2', quantity: 1, unitPrice: 45 },
      ],
    });
    expect(router.navigate).toHaveBeenCalledWith(['/sales']);
    expect(component.isSubmitting()).toBe(false);
  });

  it('blocks a price above the list price', () => {
    component.selectProduct(product('p1', 100));
    component.items.at(0).controls.unitPrice.setValue(120);

    component.confirmSale();

    expect(salesService.create).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it('does nothing with an empty cart', () => {
    component.confirmSale();

    expect(salesService.create).not.toHaveBeenCalled();
  });

  it('shows the stock warning returned by the API', () => {
    salesService.create.mockReturnValue(
      throwError(() => ({ error: { message: 'Stock insuficiente para p1' } })),
    );
    component.selectProduct(product('p1', 100));

    component.confirmSale();

    expect(component.showWarning()).toBe(true);
    expect(component.warningMessage()).toBe('Stock insuficiente para p1');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  describe('product search', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('searches active products after the debounce', () => {
      productService.getAll.mockReturnValue(of({ data: [product('p1', 100)], meta: {} }));

      component.searchControl.setValue('ye');
      expect(productService.getAll).not.toHaveBeenCalled();
      vi.advanceTimersByTime(300);

      expect(productService.getAll).toHaveBeenCalledWith(1, 10, 'ye', false, 'ACTIVE');
      expect(component.searchResults().map(p => p.id)).toEqual(['p1']);
    });

    it('ignores queries shorter than two characters', () => {
      component.searchControl.setValue('y');
      vi.advanceTimersByTime(300);

      expect(productService.getAll).not.toHaveBeenCalled();
      expect(component.showDropdown()).toBe(false);
    });
  });

  describe('client search', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    const client = { id: 'c1', name: 'Ana', workspaceId: 'w1', createdAt: '', updatedAt: '' };

    it('does not preload clients', () => {
      expect(clientsService.findAll).not.toHaveBeenCalled();
    });

    it('searches a small page of active clients after the debounce', () => {
      clientsService.findAll.mockReturnValue(of({ data: [client], meta: {} }));

      component.clientSearchControl.setValue('an');
      vi.advanceTimersByTime(300);

      expect(clientsService.findAll).toHaveBeenCalledWith(1, 8, 'an', 'ACTIVE');
      expect(component.clientResults().map(c => c.id)).toEqual(['c1']);
    });

    it('selecting and clearing a client drives the sale clientId', () => {
      component.selectClient(client);
      expect(component.clientControl.value).toBe('c1');
      expect(component.showClientDropdown()).toBe(false);

      component.clearClient();
      expect(component.clientControl.value).toBe('');
      expect(component.selectedClient()).toBeNull();
    });
  });
});
