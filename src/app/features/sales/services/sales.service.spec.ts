import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SalesService } from './sales.service';

describe('SalesService', () => {
  let service: SalesService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SalesService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('sends the local day boundaries as ISO instants', () => {
    service.findAll(1, 10, undefined, undefined, '2026-10-01', '2026-10-31').subscribe();

    const req = backend.expectOne(r => r.url === '/api/sales');
    expect(req.request.params.get('startDate')).toBe(new Date(2026, 9, 1, 0, 0, 0, 0).toISOString());
    expect(req.request.params.get('endDate')).toBe(new Date(2026, 9, 31, 23, 59, 59, 999).toISOString());
    req.flush({ data: [], meta: {} });
  });

  it('omits empty filters but keeps a zero amount', () => {
    service.findAll(2, 20, '', undefined, undefined, undefined, 0).subscribe();

    const req = backend.expectOne(r => r.url === '/api/sales');
    expect(req.request.params.keys().sort()).toEqual(['limit', 'minAmount', 'page']);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('minAmount')).toBe('0');
    req.flush({ data: [], meta: {} });
  });

  it('cancels a sale with DELETE', () => {
    service.remove('s1').subscribe();

    const req = backend.expectOne('/api/sales/s1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
