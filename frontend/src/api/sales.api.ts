import api from './axios';

export type SalesOrder = {
  id: string;
  customerId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type Quote = {
  id: string;
  customerId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type SalesListResponse = {
  items: SalesOrder[];
  total: number;
};

export type QuoteListResponse = {
  items: Quote[];
  total: number;
};

export const salesApi = {
  listQuotes: async (): Promise<QuoteListResponse> => {
    const response = await api.get<QuoteListResponse>('/quotes');
    return response.data;
  },

  getQuote: async (id: string): Promise<Quote> => {
    const response = await api.get<Quote>(`/quotes/${id}`);
    return response.data;
  },

  listSalesOrders: async (): Promise<SalesListResponse> => {
    const response = await api.get<SalesListResponse>('/sales-orders');
    return response.data;
  },

  getSalesOrder: async (id: string): Promise<SalesOrder> => {
    const response = await api.get<SalesOrder>(`/sales-orders/${id}`);
    return response.data;
  },
};

export default salesApi;
