import { TestBed } from '@angular/core/testing';
import { ProductForm } from './product-form';
import { WorkspaceContextService } from '../../../../core/services/workspace-context.service';
import { Product } from '../../../../core/models/product.model';

const validValues = { name: 'Yerba', sku: 'ALM-001', barcode: '', price: '4800.50', costPrice: '3500', stock: '40', stockMin: '' };

describe('ProductForm', () => {
  let form: ProductForm;
  let saved: { id?: string; data: Partial<Product> }[];

  const create = (product: Product | null = null) => {
    form = TestBed.runInInjectionContext(() => new ProductForm());
    form.product = product;
    form.ngOnInit();
    saved = [];
    form.save.subscribe(event => saved.push(event));
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: WorkspaceContextService, useValue: { currencySymbol: '$' } }],
    });
    create();
  });

  it('rejects prices with more than two decimals', () => {
    form.productForm.setValue({ ...validValues, price: '10.999' });

    expect(form.productForm.controls['price'].hasError('pattern')).toBe(true);
  });

  it('rejects fractional or negative stock', () => {
    form.productForm.setValue({ ...validValues, stock: '1.5' });
    expect(form.productForm.controls['stock'].hasError('pattern')).toBe(true);

    form.productForm.setValue({ ...validValues, stock: '-1' });
    expect(form.productForm.controls['stock'].invalid).toBe(true);
  });

  it('emits numeric values and defaults the minimum stock to zero', () => {
    form.productForm.setValue(validValues);

    form.onSubmit();

    expect(saved).toEqual([{
      data: { ...validValues, price: 4800.5, costPrice: 3500, stock: 40, stockMin: 0 },
    }]);
  });

  it('does not emit while invalid and marks the fields as touched', () => {
    form.onSubmit();

    expect(saved).toEqual([]);
    expect(form.productForm.touched).toBe(true);
  });

  it('includes the id when editing', () => {
    create({
      id: 'p1', name: 'Yerba', sku: 'ALM-001', price: 4800, costPrice: 3500, stock: 40, stockMin: 10,
      isActive: true, workspaceId: 'w1', createdAt: '', updatedAt: '',
    });

    form.onSubmit();

    expect(form.isEditMode).toBe(true);
    expect(saved[0].id).toBe('p1');
    expect(saved[0].data.stockMin).toBe(10);
  });
});
