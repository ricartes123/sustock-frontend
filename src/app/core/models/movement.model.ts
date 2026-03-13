export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface Movement {
  id: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  productId: string;
  workspaceId: string;
  userId?: string;
  createdAt: string;
}

export interface CreateMovementDto {
  type: MovementType;
  quantity: number;
  reason?: string;
  productId: string;
}

export interface MovementPagedResult {
  data: Movement[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
