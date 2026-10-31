import { movementKind } from './movement.model';

describe('movementKind', () => {
  const sale = { id: 's1', totalAmount: 100, createdAt: '' };

  it('tells a returned sale apart from goods received', () => {
    expect(movementKind({ type: 'IN', sale })).toEqual({ label: 'Devolución', variant: 'info' });
    expect(movementKind({ type: 'IN' })).toEqual({ label: 'Entrada', variant: 'success' });
  });

  it('tells a sale apart from a manual outflow', () => {
    expect(movementKind({ type: 'OUT', sale })).toEqual({ label: 'Venta', variant: 'error' });
    expect(movementKind({ type: 'OUT' })).toEqual({ label: 'Salida', variant: 'error' });
  });

  it('labels adjustments', () => {
    expect(movementKind({ type: 'ADJUSTMENT' })).toEqual({ label: 'Ajuste', variant: 'neutral' });
  });
});
