export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface Movement {
  id: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  product: { id: string, name: string };
  workspaceId: string;
  user: { id: string, name: string };
  createdAt: string;
}

export interface CreateMovementDto {
  type: MovementType;
  quantity: number;
  reason?: string;
  productId: string;
}
