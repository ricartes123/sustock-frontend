export interface SaleItem {
  id: string;
  saleId: string;
  quantity: number;
  price: number;
  unitCost: number;
  product: { id: string, name: string, sku: string, barcode: string };
}

export interface CreateSaleItemDto {
  productId: string;
  quantity: number;
}

export interface CreateSaleDto {
  clientId?: string;
  items: CreateSaleItemDto[];
}

export interface Sale {
  id: string;
  totalAmount: number;
  status: 'ACTIVE' | 'CANCELLED';
  cancelledAt?: string;
  workspaceId: string;
  user?: {firstName: string, lastName: string};
  createdAt: string;
  updatedAt: string;
  client?: { id: string; name: string, email: string, phone: string };
  items: SaleItem[];
}