export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  segment: 'new' | 'vip' | 'inactive';
  active: boolean;
  notes: string;
  createdAt: string;
};

const CUSTOMERS_KEY = 'sales_management_customers';

const defaultCustomers: Customer[] = [
  {
    id: 'cus-1',
    name: 'Nguyen Van A',
    email: 'a@example.com',
    phone: '0901001001',
    company: 'Minh Anh Co., Ltd.',
    address: 'Ho Chi Minh City',
    segment: 'vip',
    active: true,
    notes: 'Khach hang than thiet, uu tien ho tro nhanh.',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'cus-2',
    name: 'Tran Thi B',
    email: 'b@example.com',
    phone: '0902002002',
    company: 'Gia Huy Shop',
    address: 'Ha Noi',
    segment: 'new',
    active: true,
    notes: 'Moi lien he lan dau, can follow-up.',
    createdAt: '2026-08-02T00:00:00.000Z',
  },
];

function safeParseCustomers(raw: string | null): Customer[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Partial<Customer>[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(Boolean)
      .map((customer, index) => ({
        id: customer.id || `cus-${index + 1}`,
        name: customer.name || 'Khach hang',
        email: customer.email || '',
        phone: customer.phone || '',
        company: customer.company || '',
        address: customer.address || '',
        segment:
          customer.segment === 'vip' || customer.segment === 'inactive'
            ? customer.segment
            : 'new',
        active: typeof customer.active === 'boolean' ? customer.active : true,
        notes: customer.notes || '',
        createdAt: customer.createdAt || new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

function seedCustomers() {
  const current = safeParseCustomers(localStorage.getItem(CUSTOMERS_KEY));
  if (current.length === 0) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(defaultCustomers));
    return defaultCustomers;
  }

  const merged = [...current];
  for (const customer of defaultCustomers) {
    const exists = merged.some((item) => item.email.toLowerCase() === customer.email.toLowerCase());
    if (!exists) merged.push(customer);
  }

  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(merged));
  return merged;
}

export function getCustomers() {
  return seedCustomers();
}

export function createCustomer(input: Omit<Customer, 'id' | 'createdAt'>) {
  const customers = getCustomers();
  const emailExists = customers.some(
    (customer) => customer.email.toLowerCase() === input.email.toLowerCase(),
  );

  if (emailExists) return null;

  const customer: Customer = {
    id: `cus-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...input,
  };

  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify([...customers, customer]));
  return customer;
}

export function updateCustomer(
  id: string,
  patch: Partial<Omit<Customer, 'id' | 'createdAt'>>,
) {
  const customers = getCustomers();
  const index = customers.findIndex((customer) => customer.id === id);
  if (index < 0) return null;

  const nextEmail = patch.email?.trim().toLowerCase();
  if (nextEmail) {
    const emailExists = customers.some(
      (customer) => customer.id !== id && customer.email.toLowerCase() === nextEmail,
    );
    if (emailExists) return null;
  }

  const updated: Customer = {
    ...customers[index],
    ...patch,
    name: patch.name?.trim() || customers[index].name,
    email: patch.email?.trim() || customers[index].email,
    phone: patch.phone?.trim() || customers[index].phone,
    company: patch.company?.trim() || customers[index].company,
    address: patch.address?.trim() || customers[index].address,
    segment: patch.segment ?? customers[index].segment,
    active: typeof patch.active === 'boolean' ? patch.active : customers[index].active,
    notes: patch.notes?.trim() || customers[index].notes,
  };

  customers[index] = updated;
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  return updated;
}

export function deleteCustomer(id: string) {
  const customers = getCustomers();
  const next = customers.filter((customer) => customer.id !== id);
  if (next.length === customers.length) return false;

  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(next));
  return true;
}
