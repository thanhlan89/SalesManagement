import api from './axios';

export type Product = {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductListResponse = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
};

export type CreateProductDto = {
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  categoryId: string;
};

export type UpdateProductDto = Partial<CreateProductDto>;

export const productsApi = {
  list: async (
    search?: string,
    page = 1,
    limit = 20,
    categoryId?: string,
    minPrice?: number,
    maxPrice?: number,
    sortBy?: string,
    sortOrder?: string
  ): Promise<ProductListResponse> => {
    const response = await api.get<ProductListResponse>('/products', {
      params: { search, page, limit, categoryId, minPrice, maxPrice, sortBy, sortOrder },
    });
    return response.data;
  },

  get: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await api.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    await api.delete(`/products/${id}`);
    return { success: true };
  },
};

export default productsApi;
