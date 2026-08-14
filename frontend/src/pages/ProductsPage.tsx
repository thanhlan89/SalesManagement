import { useEffect, useState } from 'react';
import { productsApi, type Product } from '../api/products.api';
import DataTable, { type Column } from '../components/DataTable';

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productsApi.list(undefined, page, limit);
        setProducts(response.items);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  const columns: Column<Product>[] = [
    { key: 'name', label: 'Tên sản phẩm' },
    { key: 'sku', label: 'SKU' },
    { key: 'price', label: 'Giá bán', render: (v) => `₫${v.toLocaleString('vi-VN')}` },
    { key: 'stock', label: 'Tồn kho' },
    { key: 'cost', label: 'Giá vốn', render: (v) => `₫${v.toLocaleString('vi-VN')}` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sản phẩm</h1>
          <p className="mt-2 text-slate-600">Quản lý danh mục và thông tin sản phẩm doanh nghiệp</p>
        </div>
        <button className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-600">
          + Thêm sản phẩm
        </button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        emptyMessage="Không có sản phẩm nào"
      />

      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>Tổng: {total} sản phẩm</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="rounded-lg px-4 py-2 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2">Trang {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={products.length < limit}
            className="rounded-lg px-4 py-2 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;

