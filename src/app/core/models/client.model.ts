export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  workspaceId: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  phone?: string;
  email?: string;
}

export interface UpdateClientDto {
  name?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}
