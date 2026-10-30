import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('lists active products by default without empty filters', () => {
    service.getAll().subscribe();

    const req = backend.expectOne(r => r.url === '/api/products');
    expect(req.request.params.keys().sort()).toEqual(['limit', 'page', 'status']);
    expect(req.request.params.get('status')).toBe('ACTIVE');
    req.flush({ data: [], meta: {} });
  });

  it('passes search, low-stock and status filters', () => {
    service.getAll(3, 25, 'café & té', true, 'ARCHIVED').subscribe();

    const req = backend.expectOne(r => r.url === '/api/products');
    expect(req.request.params.get('page')).toBe('3');
    expect(req.request.params.get('limit')).toBe('25');
    expect(req.request.params.get('search')).toBe('café & té');
    expect(req.request.params.get('lowStock')).toBe('true');
    expect(req.request.params.get('status')).toBe('ARCHIVED');
    expect(req.request.urlWithParams).toContain('search=caf%C3%A9%20%26%20t%C3%A9');
    req.flush({ data: [], meta: {} });
  });

  it('archives with a PATCH and restores through the restore endpoint', () => {
    service.toggleStatus('p1', false).subscribe();
    const archive = backend.expectOne('/api/products/p1');
    expect(archive.request.method).toBe('PATCH');
    expect(archive.request.body).toEqual({ isActive: false });
    archive.flush({});

    service.toggleStatus('p1', true).subscribe();
    const restore = backend.expectOne('/api/products/p1/restore');
    expect(restore.request.method).toBe('POST');
    restore.flush({});
  });

  it('uploads the import file as multipart form data', () => {
    const file = new File(['name,price'], 'productos.csv', { type: 'text/csv' });

    service.importProducts(file).subscribe();

    const req = backend.expectOne('/api/products/import');
    expect(req.request.body).toBeInstanceOf(FormData);
    expect((req.request.body as FormData).get('file')).toBe(file);
    req.flush({ created: 0, total: 0, errors: [] });
  });
});
