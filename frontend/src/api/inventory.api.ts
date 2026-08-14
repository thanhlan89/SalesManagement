import api from './axios';

export type Warehouse = {
  id: string;
  name: string;
  location?: string;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
};

export type InventoryBalance = {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

export type WarehouseListResponse = {
  items: Warehouse[];
};

export type InventoryListResponse = {
  items: InventoryBalance[];
};

export const inventoryApi = {
  listWarehouses: async (): Promise<WarehouseListResponse> => {
    const response = await api.get<WarehouseListResponse>('/warehouses');
    return response.data;
  },

  getWarehouse: async (id: string): Promise<Warehouse> => {
    const response = await api.get<Warehouse>(`/warehouses/${id}`);
    return response.data;
  },

  listBalances: async (productId?: string, warehouseId?: string): Promise<InventoryListResponse> => {
    const response = await api.get<InventoryListResponse>('/inventory-balances', {
      params: { productId, warehouseId },
    });
    return response.data;
  },
};

export default inventoryApi;
