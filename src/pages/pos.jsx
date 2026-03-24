import { useState, useEffect } from 'react';
import * as api from '../services/api';

export default function Pos() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [paid, setPaid] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getProducts().then(ps => setProducts(ps.filter(p => p.status === 'available' && p.stock > 0)));
  }, []);

  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const p = products.find(p => p.id === Number(id));
      return p ? { productId: p.id, name: p.name, qty, price: p.price, image: p.image } : null;
    }).filter(Boolean);

  const total = cartItems.reduce((s, i) => s + i.qty * i.price, 0);
  const change = Number(paid) - total;

  const setQty = (id, qty) => setCart(prev => ({ ...prev, [id]: Math.max(0, qty) }));

  const quickAdd = (id) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  const handleSell = async () => {
    if (!cartItems.length) return alert('กรุณาเลือกสินค้า');
    if (Number(paid) < total) return alert('เงินที่รับมาไม่พอ');
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const newOrder = await api.createOrder({
      type: 'walkin',
      customerName: 'ลูกค้าหน้าร้าน',
      phone: '-',
      items: cartItems,
      pickupDate: today,
      pickupTime: 'ทันที',
      total,
    });
    setReceipt({ order: newOrder, paid: Number(paid), change });
    setCart({});
    setPaid('');
    setLoading(false);
    api.getProducts().then(ps => setProducts(ps.filter(p => p.status === 'available' && p.stock > 0)));
  };

  const QUICK_AMOUNTS = [100, 200, 500, 1000];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🛒 ขายหน้าร้าน (POS)</h1>
        <p className="page-sub">บันทึกการขายสำหรับลูกค้าที่ซื้อสินค้าหน้าร้าน</p>
      </div>

      {receipt && (
        <div className="receipt-overlay" onClick={() => setReceipt(null)}>
          <div className="receipt card" onClick={e => e.stopPropagation()}>
            <div className="receipt-header">🐷 แคบหมูกรอบ</div>
            <div className="receipt-id">#{receipt.order.id}</div>
            <div className="receipt-time">{new Date().toLocaleString('th-TH')}</div>
            <hr />
            {receipt.order.items.map((item, i) => (
              <div key={i} className="receipt-row">
                <span>{item.name} × {item.qty}</span>
                <span>฿{item.qty * item.price}</span>
              </div>
            ))}
            <hr />
            <div className="receipt-row bold"><span>รวม</span><span>฿{receipt.order.total}</span></div>
            <div className="receipt-row"><span>รับเงิน</span><span>฿{receipt.paid}</span></div>
            <div className="receipt-row change"><span>เงินทอน</span><span>฿{receipt.change}</span></div>
            <div className="receipt-thanks">ขอบคุณที่ใช้บริการ 🙏</div>
            <button className="btn-primary full-width" onClick={() => setReceipt(null)}>✕ ปิด</button>
          </div>
        </div>
      )}

      <div className="pos-layout">
        <div className="pos-products">
          <h3>🥩 สินค้า</h3>
          <div className="pos-grid">
            {products.map(p => (
              <button key={p.id} className="pos-product-btn" onClick={() => quickAdd(p.id)}>
                <div className="pos-emoji">{p.image}</div>
                <div className="pos-name">{p.name}</div>
                <div className="pos-price">฿{p.price}</div>
                <div className="pos-stock">คงเหลือ: {p.stock}</div>
                {cart[p.id] > 0 && <div className="pos-badge">{cart[p.id]}</div>}
              </button>
            ))}
          </div>
        </div>

        <div className="pos-cart card">
          <h3>🧾 รายการขาย</h3>

          {cartItems.length === 0 ? (
            <div className="empty-cart">กดเลือกสินค้าด้านซ้าย</div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map((item, i) => (
                  <div key={i} className="pos-cart-row">
                    <span className="ci-name">{item.image} {item.name}</span>
                    <div className="ci-qty-ctrl">
                      <button className="qty-btn sm" onClick={() => setQty(item.productId, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button className="qty-btn sm" onClick={() => setQty(item.productId, item.qty + 1)}>+</button>
                    </div>
                    <span className="ci-price">฿{item.qty * item.price}</span>
                  </div>
                ))}
              </div>

              <div className="pos-total">รวม: ฿{total.toLocaleString()}</div>

              <div className="payment-section">
                <label>รับเงินมา (บาท)</label>
                <input
                  type="number" value={paid} onChange={e => setPaid(e.target.value)}
                  placeholder="0" className="paid-input"
                />
                <div className="quick-amounts">
                  {QUICK_AMOUNTS.map(a => (
                    <button key={a} className="quick-btn" onClick={() => setPaid(String(a))}>฿{a}</button>
                  ))}
                  <button className="quick-btn exact" onClick={() => setPaid(String(total))}>พอดี</button>
                </div>
                {paid && Number(paid) >= total && (
                  <div className="change-display">เงินทอน: ฿{change.toLocaleString()}</div>
                )}
                {paid && Number(paid) < total && (
                  <div className="change-display error">ขาดอีก: ฿{(total - Number(paid)).toLocaleString()}</div>
                )}
              </div>

              <button
                className="btn-primary full-width sell-btn"
                onClick={handleSell}
                disabled={loading || !paid || Number(paid) < total}
              >
                {loading ? 'กำลังบันทึก...' : '✅ ยืนยันการขาย'}
              </button>
              <button className="btn-secondary full-width" onClick={() => setCart({})}>🗑️ ล้างรายการ</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}