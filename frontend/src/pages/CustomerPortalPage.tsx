import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../lib/auth';
import {
  calculateVoucherDiscount,
  formatCurrency,
  getCatalog,
  getCustomerOrders,
  getMyReviews,
  getProductReviewSummary,
  getProductReviews,
  getVoucherByCode,
  getVouchers,
  placeOrder,
  searchCatalogByDescription,
  submitReview,
  type CartLine,
  type CatalogItem,
  type CatalogSearchResult,
  type CustomerOrder,
  type Voucher,
  type ProductReview,
} from '../lib/storefront';

type ViewMode = 'store' | 'orders' | 'reviews' | 'account';

type ChatMessage = {
  id: string;
  role: 'customer' | 'assistant';
  text: string;
  results?: CatalogSearchResult[];
};

const emptyReview = {
  rating: 5,
  comment: '',
};

function CustomerPortalPage() {
  const navigate = useNavigate();
  const session = getSession();
  const catalog = getCatalog();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<ViewMode>('store');
  const [selectedProductId, setSelectedProductId] = useState(catalog[0]?.id ?? '');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>(
    () => (session?.email ? getCustomerOrders(session.email) : []),
  );
  const [reviewForm, setReviewForm] = useState(emptyReview);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Bạn cần tìm món gì? Hãy mô tả nhu cầu, ví dụ: "tai nghe chống ồn để họp" hoặc "quà tặng khách hàng giá rẻ".',
    },
  ]);
  const [message, setMessage] = useState('');
  const [productPage, setProductPage] = useState(1);

  const selectedProduct = useMemo(
    () => catalog.find((item) => item.id === selectedProductId) ?? catalog[0] ?? null,
    [catalog, selectedProductId],
  );

  const filteredCatalog = useMemo(() => {
    const term = query.trim();
    if (!term) return catalog;

    return searchCatalogByDescription(term, catalog.length);
  }, [catalog, query]);

  useEffect(() => {
    setProductPage(1);
  }, [query]);

  const productsPerPage = 10;
  const totalProductPages = Math.max(1, Math.ceil(filteredCatalog.length / productsPerPage));
  const displayedCatalog = filteredCatalog.slice(
    (productPage - 1) * productsPerPage,
    productPage * productsPerPage,
  );

  const cartSummary = useMemo(() => {
    return cart.reduce(
      (acc, line) => {
        const item = catalog.find((entry) => entry.id === line.itemId);
        if (!item) return acc;

        acc.count += line.quantity;
        acc.total += item.price * line.quantity;
        return acc;
      },
      { count: 0, total: 0 },
    );
  }, [cart, catalog]);

  const voucherDiscount = useMemo(() => {
    return calculateVoucherDiscount(cartSummary.total, appliedVoucher);
  }, [appliedVoucher, cartSummary.total]);

  const payableTotal = Math.max(0, cartSummary.total - voucherDiscount);

  const availableVouchers = useMemo(() => getVouchers(), [message, mode, cartSummary.total]);

  const myReviews = useMemo(() => {
    return session?.email ? getMyReviews(session.email) : [];
  }, [session?.email, message, selectedProductId, mode]);

  const productReviews = useMemo(() => {
    return selectedProduct ? getProductReviews(selectedProduct.id) : [];
  }, [selectedProduct, message, selectedProductId, mode]);

  const selectedSummary = useMemo(() => {
    return selectedProduct ? getProductReviewSummary(selectedProduct.id) : { count: 0, average: 0 };
  }, [selectedProduct, message, selectedProductId, mode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const addToCart = (item: CatalogItem) => {
    setMessage('');
    setCart((current) => {
      const existing = current.find((line) => line.itemId === item.id);
      if (!existing) return [...current, { itemId: item.id, quantity: 1 }];

      return current.map((line) =>
        line.itemId === item.id ? { ...line, quantity: line.quantity + 1 } : line,
      );
    });
  };

  const applyVoucher = () => {
    const voucher = getVoucherByCode(voucherCode);
    if (!voucher) {
      setAppliedVoucher(null);
      setMessage('Mã voucher không hợp lệ.');
      return;
    }

    if (cartSummary.total < voucher.minOrder) {
      setAppliedVoucher(null);
      setMessage(`Đơn hàng tối thiểu để dùng mã này là ${formatCurrency(voucher.minOrder)}.`);
      return;
    }

    setAppliedVoucher(voucher);
    setMessage(`Đã áp dụng voucher ${voucher.code}.`);
  };

  const clearVoucher = () => {
    setVoucherCode('');
    setAppliedVoucher(null);
    setMessage('Đã gỡ voucher.');
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCart((current) =>
      current
        .map((line) => (line.itemId === itemId ? { ...line, quantity } : line))
        .filter((line) => line.quantity > 0),
    );
  };

  const handlePlaceOrder = () => {
    if (!session?.email || cart.length === 0) {
      setMessage('Giỏ hàng đang trống.');
      return;
    }

    const order = placeOrder(session.email, cart, appliedVoucher);
    if (!order) {
      setMessage('Không thể tạo đơn hàng.');
      return;
    }

    setOrders(getCustomerOrders(session.email));
    setCart([]);
    setVoucherCode('');
    setAppliedVoucher(null);
    setMessage(`Đã tạo đơn ${order.id}.`);
    setMode('orders');
  };

  const handleSubmitReview = () => {
    if (!session || !selectedProduct) {
      setMessage('Không tìm thấy sản phẩm để đánh giá.');
      return;
    }

    const created = submitReview({
      productId: selectedProduct.id,
      email: session.email,
      name: session.name,
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
    });

    if (!created) {
      setMessage('Không thể gửi đánh giá.');
      return;
    }

    setReviewForm(emptyReview);
    setMessage('Đánh giá đã được gửi.');
    setMode('reviews');
  };

  const handleChatSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const question = chatInput.trim();
    if (!question) return;

    const results = searchCatalogByDescription(question, 3);
    const assistantText =
      results.length > 0
        ? `Mình tìm thấy ${results.length} sản phẩm hợp với mô tả của bạn.`
        : 'Mình chưa thấy sản phẩm nào thật sự khớp. Bạn thử mô tả rõ hơn về nhu cầu, khoảng giá hoặc mục đích sử dụng nhé.';

    setChatMessages((current) => [
      ...current,
      {
        id: `customer-${Date.now()}`,
        role: 'customer',
        text: question,
      },
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: assistantText,
        results,
      },
    ]);
    setChatInput('');
    setMode('store');
  };

  const showChatProduct = (item: CatalogItem) => {
    setSelectedProductId(item.id);
    setQuery(item.name);
    setMode('store');
    setMessage(`Đã lọc theo ${item.name}.`);
  };

  const featured = filteredCatalog.slice(0, 3);

  return (
    <main className="customer-portal">
      <aside className="customer-sidebar">
        <div className="customer-brand">
          <div className="customer-logo">C</div>
          <div>
            <h1>Customer Hub</h1>
            <p>Trung tâm mua hàng</p>
          </div>
        </div>

        <nav className="customer-nav">
          <button className={mode === 'store' ? 'active' : ''} onClick={() => setMode('store')}>
            Cửa hàng
          </button>
          <button className={mode === 'orders' ? 'active' : ''} onClick={() => setMode('orders')}>
            Đơn hàng
          </button>
          <button className={mode === 'reviews' ? 'active' : ''} onClick={() => setMode('reviews')}>
            Đánh giá
          </button>
          <button className={mode === 'account' ? 'active' : ''} onClick={() => setMode('account')}>
            Tài khoản
          </button>
        </nav>

        <div className="customer-summary">
          <p>Xin chào</p>
          <strong>{session?.name}</strong>
          <span>{session?.email}</span>
        </div>

        <button className="customer-logout" onClick={handleLogout}>
          Đăng xuất
        </button>
      </aside>

      <section className="customer-main">
        <header className="customer-hero">
          <div>
            <p className="eyebrow">Mua nhanh, theo dõi rõ</p>
            <h2>Chào mừng bạn quay lại, {session?.name}</h2>
            <p className="hero-copy">
              Xem sản phẩm nổi bật, thêm vào giỏ, tạo đơn nhanh, gửi đánh giá và theo dõi phản hồi
              ngay tại một nơi.
            </p>
          </div>

          <div className="hero-metrics">
            <div>
              <strong>{featured.length}</strong>
              <span>Sản phẩm nổi bật</span>
            </div>
            <div>
              <strong>{cartSummary.count}</strong>
              <span>Sản phẩm trong giỏ</span>
            </div>
            <div>
              <strong>{availableVouchers.length}</strong>
              <span>Voucher khả dụng</span>
            </div>
            <div>
              <strong>{orders.length}</strong>
              <span>Đơn gần đây</span>
            </div>
          </div>
        </header>

        <div className="customer-toolbar">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Bạn đang tìm gì? Hãy mô tả sản phẩm nhé..."
          />
          <button onClick={() => setMode('store')}>Xem cửa hàng</button>
        </div>

        {message ? <div className="customer-banner">{message}</div> : null}

        {mode === 'store' ? (
          <section className="customer-layout">
            <div className="customer-content">
              <section className="chat-assistant" aria-label="Trợ lý tìm sản phẩm">
                <div className="section-head">
                  <div>
                    <h3>Trợ lý chọn sản phẩm</h3>
                    <p>Mô tả nhu cầu, chatbot sẽ chỉ ra món phù hợp</p>
                  </div>
                </div>

                <div className="chat-window">
                  {chatMessages.map((chat) => (
                    <div className={`chat-message ${chat.role}`} key={chat.id}>
                      <p>{chat.text}</p>
                      {chat.results?.length ? (
                        <div className="chat-results">
                          {chat.results.map((item) => (
                            <article className="chat-result-card" key={item.id}>
                              <div>
                                <strong>{item.name}</strong>
                                <span>{item.matchReasons.join(' · ')}</span>
                                <small>
                                  {formatCurrency(item.price)} · còn {item.stock}
                                </small>
                              </div>
                              <div className="chat-result-actions">
                                <button type="button" onClick={() => showChatProduct(item)}>
                                  Xem
                                </button>
                                <button type="button" onClick={() => addToCart(item)}>
                                  Thêm
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                <form className="chat-form" onSubmit={handleChatSubmit}>
                  <input
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="Ví dụ: màn hình làm việc đa nhiệm dưới 8 triệu"
                  />
                  <button type="submit">Hỏi</button>
                </form>
              </section>

              <div className="section-head">
                <h3>Sản phẩm</h3>
                <p>{filteredCatalog.length} kết quả</p>
              </div>

              <div className="product-grid">
                {displayedCatalog.map((item) => {
                  const summary = getProductReviewSummary(item.id);
                  return (
                    <article className="product-card" key={item.id}>
                      <div className="product-badge">{item.badge}</div>
                      <div className="product-visual">{item.category.slice(0, 1)}</div>
                      <h4>{item.name}</h4>
                      <p>{item.description}</p>
                      <div className="product-meta">
                        <strong>{formatCurrency(item.price)}</strong>
                        <span>⭐ {item.rating}</span>
                      </div>
                      <div className="product-summary-line">
                        <span>{summary.count} đánh giá</span>
                        <span>TB {summary.average || '0.0'} sao</span>
                      </div>
                      <div className="product-footer">
                        <span>Còn {item.stock}</span>
                        <div className="product-actions">
                          <button
                            type="button"
                            className="ghost-action"
                            onClick={() => {
                              setSelectedProductId(item.id);
                              setMode('reviews');
                            }}
                          >
                            Đánh giá
                          </button>
                          <button type="button" onClick={() => addToCart(item)}>
                            Thêm vào giỏ
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              {totalProductPages > 1 ? (
                <div className="product-pagination" aria-label="Phân trang sản phẩm">
                  <button
                    type="button"
                    disabled={productPage === 1}
                    onClick={() => setProductPage((page) => Math.max(1, page - 1))}
                  >
                    Trang trước
                  </button>
                  <span>
                    Trang {productPage} / {totalProductPages}
                  </span>
                  <button
                    type="button"
                    disabled={productPage === totalProductPages}
                    onClick={() =>
                      setProductPage((page) => Math.min(totalProductPages, page + 1))
                    }
                  >
                    Trang sau
                  </button>
                </div>
              ) : null}
            </div>

            <aside className="cart-panel">
              <div className="section-head">
                <h3>Giỏ hàng</h3>
                <p>{cartSummary.count} món</p>
              </div>

              <div className="cart-list">
                {cart.length === 0 ? (
                  <p className="empty-note">Chưa có sản phẩm nào trong giỏ.</p>
                ) : (
                  cart.map((line) => {
                    const item = catalog.find((entry) => entry.id === line.itemId);
                    if (!item) return null;

                    return (
                      <div className="cart-line" key={line.itemId}>
                        <div>
                          <strong>{item.name}</strong>
                          <span>{formatCurrency(item.price)}</span>
                        </div>
                        <div className="cart-controls">
                          <button type="button" onClick={() => updateQuantity(line.itemId, line.quantity - 1)}>
                            -
                          </button>
                          <strong>{line.quantity}</strong>
                          <button type="button" onClick={() => updateQuantity(line.itemId, line.quantity + 1)}>
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="cart-total">
                <span>Tạm tính</span>
                <strong>{formatCurrency(cartSummary.total)}</strong>
              </div>

              <div className="voucher-box">
                <div className="voucher-header">
                  <strong>Voucher</strong>
                  <span>{appliedVoucher ? appliedVoucher.code : 'Chưa áp dụng'}</span>
                </div>
                <div className="voucher-input-row">
                  <input
                    value={voucherCode}
                    onChange={(event) => setVoucherCode(event.target.value)}
                    placeholder="Nhập mã voucher"
                  />
                  <button type="button" onClick={applyVoucher}>
                    Áp dụng
                  </button>
                </div>
                {appliedVoucher ? (
                  <div className="voucher-applied">
                    <span>
                      Giảm {formatCurrency(voucherDiscount)} từ mã {appliedVoucher.code}
                    </span>
                    <button type="button" onClick={clearVoucher}>
                      Gỡ
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="cart-total final">
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(payableTotal)}</strong>
              </div>

              <button className="checkout-button" onClick={handlePlaceOrder}>
                Đặt hàng ngay
              </button>
            </aside>
          </section>
        ) : null}

        {mode === 'orders' ? (
          <section className="customer-orders">
            <div className="section-head">
              <h3>Đơn hàng gần đây</h3>
              <p>{orders.length} đơn</p>
            </div>

            <div className="orders-list">
              {orders.length === 0 ? (
                <p className="empty-note">Bạn chưa có đơn hàng nào.</p>
              ) : (
                orders.map((order) => (
                  <article className="order-card" key={order.id}>
                    <div className="order-top">
                      <div>
                        <strong>{order.id}</strong>
                        <span>{new Date(order.placedAt).toLocaleString('vi-VN')}</span>
                      </div>
                      <span className={`order-status ${order.status}`}>{order.status}</span>
                    </div>

                    <div className="order-items">
                      {order.items.map((item) => (
                        <div className="order-item" key={item.itemId}>
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <strong>{formatCurrency(item.price * item.quantity)}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="order-total">
                      <span>Tổng cộng</span>
                      <strong>{formatCurrency(order.total)}</strong>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ) : null}

        {mode === 'reviews' ? (
          <section className="customer-reviews">
            <div className="review-layout">
              <article className="review-form-card">
                <div className="section-head">
                  <h3>Đánh giá sản phẩm</h3>
                  <p>Chọn sản phẩm và để lại nhận xét</p>
                </div>

                <label className="review-select">
                  Sản phẩm
                  <select
                    value={selectedProductId}
                    onChange={(event) => setSelectedProductId(event.target.value)}
                  >
                    {catalog.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="review-stars">
                  {[5, 4, 3, 2, 1].map((value) => (
                    <button
                      type="button"
                      key={value}
                      className={reviewForm.rating === value ? 'active' : ''}
                      onClick={() => setReviewForm((current) => ({ ...current, rating: value }))}
                    >
                      {value} sao
                    </button>
                  ))}
                </div>

                <label className="review-comment">
                  Bình luận
                  <textarea
                    rows={5}
                    value={reviewForm.comment}
                    onChange={(event) =>
                      setReviewForm((current) => ({ ...current, comment: event.target.value }))
                    }
                    placeholder="Chia sẻ cảm nhận của bạn..."
                  />
                </label>

                <button className="checkout-button" onClick={handleSubmitReview}>
                  Gửi đánh giá
                </button>
              </article>

              <article className="review-summary-card">
                <div className="section-head">
                  <h3>{selectedProduct?.name ?? 'Sản phẩm'}</h3>
                  <p>
                    TB {selectedSummary.average || '0.0'} sao
                    {' · '}
                    {selectedSummary.count} đánh giá
                  </p>
                </div>

                <div className="review-preview">
                  <div className="product-visual review-visual">
                    {selectedProduct?.category.slice(0, 1) ?? 'C'}
                  </div>
                  <p>{selectedProduct?.description}</p>
                </div>

                <div className="review-list">
                  {productReviews.length === 0 ? (
                    <p className="empty-note">Chưa có đánh giá nào cho sản phẩm này.</p>
                  ) : (
                    productReviews.map((review: ProductReview) => (
                      <article className="comment-card" key={review.id}>
                        <div className="comment-top">
                          <strong>{review.name}</strong>
                          <span>{review.rating} sao</span>
                        </div>
                        <p>{review.comment || 'Không có nội dung bình luận.'}</p>
                        <small>{new Date(review.createdAt).toLocaleString('vi-VN')}</small>
                      </article>
                    ))
                  )}
                </div>

                <div className="my-review-block">
                  <div className="section-head">
                    <h3>Bình luận của bạn</h3>
                    <p>{myReviews.length} bài</p>
                  </div>

                  <div className="review-list compact">
                    {myReviews.length === 0 ? (
                      <p className="empty-note">Bạn chưa gửi đánh giá nào.</p>
                    ) : (
                      myReviews.map((review) => (
                        <article className="comment-card" key={review.id}>
                          <div className="comment-top">
                            <strong>{review.name}</strong>
                            <span>{review.rating} sao</span>
                          </div>
                          <p>{review.comment || 'Không có nội dung bình luận.'}</p>
                          <small>{new Date(review.createdAt).toLocaleString('vi-VN')}</small>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </article>
            </div>
          </section>
        ) : null}

        {mode === 'account' ? (
          <section className="customer-account">
            <div className="account-card">
              <p className="section-label">Hồ sơ của bạn</p>
              <h3>{session?.name}</h3>
              <p>{session?.email}</p>
              <div className="account-chip">Vai trò: Khách hàng</div>
            </div>

            <div className="account-card">
              <p className="section-label">Cần hỗ trợ?</p>
              <h3>Chat với chúng tôi</h3>
              <p>
                Nếu đơn hàng gặp vấn đề, hãy gửi yêu cầu hỗ trợ và đội ngũ chăm sóc sẽ phản hồi sớm.
              </p>
              <button className="support-button">Tạo yêu cầu hỗ trợ</button>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

export default CustomerPortalPage;
