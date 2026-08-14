import api from './axios';

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomerListResponse = {
  items: Customer[];
  total: number;
  page: number;
  limit: number;
};

export type CreateCustomerDto = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
};

export type UpdateCustomerDto = Partial<CreateCustomerDto>;

export const customersApi = {
  list: async (search?: string, page = 1, limit = 20): Promise<CustomerListResponse> => {
    const response = await api.get<CustomerListResponse>('/customers', {
      params: { search, page, limit },
    });
    return response.data;
  },

  get: async (id: string): Promise<Customer> => {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  create: async (data: CreateCustomerDto): Promise<Customer> => {
    const response = await api.post<Customer>('/customers', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCustomerDto): Promise<Customer> => {
    const response = await api.patch<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    await api.delete(`/customers/${id}`);
    return { success: true };
  },
};

export default customersApi;
