export interface Product {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  costPrice: number;
  price: number;
  stock: number;
  stockMin: number;
  isActive: boolean;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPagedResult {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
