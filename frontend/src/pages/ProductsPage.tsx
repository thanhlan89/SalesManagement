import { useEffect, useState } from 'react';
import { productsApi, type Product } from '../api/products.api';
import DataTable, { type Column } from '../components/DataTable';
import Modal from '../components/Modal';
import { Input, Select, Button } from '../components/FormControls';
import { useToast } from '../hooks/useToast.tsx';
import TableFilter from '../components/TableFilter';

function ProductsPage() {
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', cost: '', stock: '', categoryId: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const limit = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productsApi.list(searchQuery || undefined, page, limit);
        setProducts(response.items);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        addToast('Lỗi khi tải sản phẩm', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [page, searchQuery, addToast]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleOpenModal = () => {
    setFormData({ name: '', sku: '', price: '', cost: '', stock: '', categoryId: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', sku: '', price: '', cost: '', stock: '', categoryId: '' });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = 'Tên sản phẩm là bắt buộc';
    if (!formData.sku) errors.sku = 'SKU là bắt buộc';
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Giá bán phải lớn hơn 0';
    if (!formData.cost || parseFloat(formData.cost) <= 0) errors.cost = 'Giá vốn phải lớn hơn 0';
    if (!formData.stock || parseInt(formData.stock) < 0) errors.stock = 'Tồn kho không hợp lệ';
    if (!formData.categoryId) errors.categoryId = 'Danh mục là bắt buộc';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await productsApi.create({
        name: formData.name,
        sku: formData.sku,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: parseInt(formData.stock),
        categoryId: formData.categoryId,
      });
      addToast('Thêm sản phẩm thành công', 'success');
      handleCloseModal();
      setPage(1);
      // Refetch products
      const response = await productsApi.list(searchQuery || undefined, 1, limit);
      setProducts(response.items);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to create product:', error);
      addToast('Lỗi khi thêm sản phẩm', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <button
          onClick={handleOpenModal}
          className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-600"
        >
          + Thêm sản phẩm
        </button>
      </div>

      <TableFilter onSearch={handleSearch} placeholder="Tìm kiếm tên sản phẩm..." />

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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Thêm sản phẩm mới"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button isLoading={isSubmitting} onClick={handleSubmit}>
              Thêm sản phẩm
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Tên sản phẩm"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            placeholder="Nhập tên sản phẩm"
          />
          <Input
            label="SKU"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            error={formErrors.sku}
            placeholder="Nhập SKU"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Giá bán"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              error={formErrors.price}
              placeholder="0"
            />
            <Input
              label="Giá vốn"
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              error={formErrors.cost}
              placeholder="0"
            />
          </div>
          <Input
            label="Tồn kho"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            error={formErrors.stock}
            placeholder="0"
          />
          <Select
            label="Danh mục"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            options={[
              { value: 'cat-1', label: 'Điện tử' },
              { value: 'cat-2', label: 'Quần áo' },
              { value: 'cat-3', label: 'Thực phẩm' },
            ]}
            error={formErrors.categoryId}
          />
        </div>
      </Modal>
    </div>
  );
}

export default ProductsPage;


