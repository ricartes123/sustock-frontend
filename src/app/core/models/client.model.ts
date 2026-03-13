export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  phone?: string;
  email?: string;
}
