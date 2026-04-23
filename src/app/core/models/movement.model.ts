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

export interface CreateMovementDto {
  type: MovementType;
  quantity: number;
  reason?: string;
  productId: string;
}
