export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  price: number;
  unitCost: number;
  product: { name: string, sku: string, barcode: string };
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
  clientId?: string;
  workspaceId: string;
  user?: {firstName: string, lastName: string};
  createdAt: string;
  updatedAt: string;
  client?: { id: string; name: string, email: string, phone: string };
  items: SaleItem[];
}