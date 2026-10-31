import type { BadgeVariant } from '../../shared/components/badge/badge';

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface Movement {
  id: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  sale?: { id: string; totalAmount: number; createdAt: string; client?: { id: string, name: string } };
  product: { id: string, name: string };
  user: { id: string, firstName: string, lastName: string };
  createdAt: string;
}

export interface MovementKind {
  label: string;
  variant: BadgeVariant;
}

// An IN tied to a sale can only come from cancelling it: the stock goes back.
export function movementKind(mov: Pick<Movement, 'type' | 'sale'>): MovementKind {
  switch (mov.type) {
    case 'IN':
      return mov.sale ? { label: 'Devolución', variant: 'info' } : { label: 'Entrada', variant: 'success' };
    case 'OUT':
      return { label: mov.sale ? 'Venta' : 'Salida', variant: 'error' };
    case 'ADJUSTMENT':
      return { label: 'Ajuste', variant: 'neutral' };
  }
}

export interface CreateMovementDto {
  type: MovementType;
  quantity: number;
  reason?: string;
  productId: string;
}
