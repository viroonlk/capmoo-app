import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

// 🌟 รับ setActivePage มาเป็น Prop เพื่อสั่งเปลี่ยนไปหน้า login ได้
export default function Customer({ setActivePage }) {
  const { user } = useAuth(); 
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [form, setForm] = useState({ name: user?.username || '', phone: '', pickupDate: '', pickupTime: '09:00' });
  const [step, setStep] = useState(1);
  const [stockCheck, setStockCheck] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const [myOrders, setMyOrders] = useState([]);
  const [queueCount, setQueueCount] = useState(0);

  const TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  useEffect(() => {
    api.getProducts().then(ps => setProducts(ps.filter(p => p.status === 'available')));
  }, []);

  const loadMyOrders = async () => {
    try {
      const allOrders = await api.getOrders();
      const active = allOrders.filter(o => 
        o.customerName === user?.username && 
        !['completed', 'cancelled'].includes(o.status)
      );
      setMyOrders(active);

      const totalQueue = allOrders.filter(o => 
        ['pending', 'confirmed', 'preparing'].includes(o.status)
      ).length;
      setQueueCount(totalQueue);
    } catch (error) {
      console.error("โหลดข้อมูลออเดอร์ล้มเหลว", error);
    }
  };

  useEffect(() => {
    if (user) {
      loadMyOrders();
    }
  }, [user]);

  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const p = products.find(p => p.id === Number(id));
      return p ? { productId: p.id, name: p.name, qty, price: p.price } : null;
    }).filter(Boolean);

  const total = cartItems.reduce((s, i) => s + i.qty * i.price, 0);

  const setQty = (id, qty) => setCart(prev => ({ ...prev, [id]: Math.max(0, qty) }));

  const handleReview = async () => {
    // 🌟 ดักไว้ตรงนี้: ถ้ายังไม่ล็อกอิน ให้แจ้งเตือนและส่งไปหน้า login
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งจองครับ');
      if (setActivePage) setActivePage('login');
      return;
    }

    if (!cartItems.length) return alert('กรุณาเลือกสินค้า');
    if (!form.name || !form.phone || !form.pickupDate) return alert('กรุณากรอกข้อมูลให้ครบ');
    
    setLoading(true);
    const check = await api.checkStock(form.pickupDate, cartItems);
    setStockCheck(check);
    setLoading(false);
    setStep(2);
  };

  const handleConfirm = async () => {
    setLoading(true);
    const newOrder = await api.createOrder({
      type: 'online',
      customerName: form.name,
      phone: form.phone,
      items: cartItems,
      pickupDate: form.pickupDate,
      pickupTime: form.pickupTime,
      total,
    });
    setOrder(newOrder);
    setStep(3);
    setLoading(false);
    loadMyOrders();
  };

  const reset = () => { setCart({}); setStep(1); setOrder(null); setStockCheck(null); };

  if (step === 3 && order) return (
    <div className="page">
      <div className="confirm-box card">
        <div className="confirm-icon">🎉</div>
        <h2>จองสำเร็จ!</h2>
        <p className="confirm-id">รหัสออเดอร์: <strong>{order.id}</strong></p>
        <div className="confirm-detail">
          <div>👤 {form.name} | 📞 {form.phone}</div>
          <div>📅 {order.pickupDate} ⏰ {order.pickupTime}</div>
          <hr />
          {cartItems.map((item, i) => (
            <div key={i} className="confirm-item">{item.name} × {item.qty} = ฿{item.qty * item.price}</div>
          ))}
          <div className="confirm-total">💰 รวมทั้งสิ้น: <strong>฿{total.toLocaleString()}</strong></div>
        </div>
        <button className="btn-primary" onClick={reset}>🔄 สั่งจองเพิ่ม</button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📱 สั่งจองออนไลน์</h1>
        <p className="page-sub">จองสินค้าล่วงหน้า — รับได้ตามวันเวลาที่เลือก</p>
      </div>

      {/* 🌟 ป้ายแจ้งเตือนให้เข้าสู่ระบบ (แสดงเฉพาะตอนยังไม่ล็อกอิน) */}
      {!user && (
        <div className="alert alert-error" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(232, 64, 32, 0.1)', border: '1px solid rgba(232, 64, 32, 0.3)', color: '#f08070' }}>
          <div><strong>⚠️ คุณยังไม่ได้เข้าสู่ระบบ</strong><br/>สามารถเลือกดูสินค้าได้ แต่กรุณาเข้าสู่ระบบก่อนทำการสั่งจอง</div>
          {setActivePage && (
            <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={() => setActivePage('login')}>
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      )}

      {myOrders.length > 0 && (
        <div className="card" style={{ marginBottom: '28px', borderLeft: '4px solid var(--primary)', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', margin: 0, color: 'var(--text)' }}>📦 สถานะออเดอร์ของคุณ</h3>
            <div style={{ background: 'var(--bg2)', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', color: 'var(--text2)', border: '1px solid var(--card-border)' }}>
              คิวรอในระบบขณะนี้: <strong style={{ color: 'var(--primary)', fontSize: '16px' }}>{queueCount}</strong> คิว
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {myOrders.map(order => (
              <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--bg2)', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: '800', color: 'var(--primary)', marginBottom: '4px' }}>
                    ออเดอร์ #{order.id}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                    {order.items.map(item => `${item.name} (${item.qty})`).join(', ')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`status-pill st-${order.status}`}>
                    {order.status === 'pending' ? 'รอยืนยัน' :
                     order.status === 'confirmed' ? 'รับออเดอร์แล้ว' :
                     order.status === 'preparing' ? 'กำลังเตรียม' :
                     order.status === 'ready' ? '✅ รอรับสินค้า' : order.status}
                  </span>
                  <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '6px' }}>
                    รับเวลา: {order.pickupTime} น.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="step-bar">
        {['เลือกสินค้า', 'ตรวจสอบ', 'ยืนยัน'].map((s, i) => (
          <div key={i} className={`step ${step > i ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
            <div className="step-num">{step > i + 1 ? '✓' : i + 1}</div>
            <div className="step-label">{s}</div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <>
          <div className="customer-info-form card">
            <h3>📋 ข้อมูลผู้สั่งจอง</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>ชื่อ-นามสกุล</label>
                {/* 🌟 ถ้าไม่ได้ล็อกอิน ให้ปิดช่องไม่ให้พิมพ์ */}
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ชื่อของคุณ" disabled={!user} />
              </div>
              <div className="form-group">
                <label>เบอร์โทร</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="08x-xxx-xxxx" disabled={!user} />
              </div>
              <div className="form-group">
                <label>วันที่รับสินค้า</label>
                <input type="date" value={form.pickupDate} min={new Date().toISOString().split('T')[0]} onChange={e => setForm({ ...form, pickupDate: e.target.value })} className="date-input" disabled={!user} />
              </div>
              <div className="form-group">
                <label>เวลารับสินค้า</label>
                <select value={form.pickupTime} onChange={e => setForm({ ...form, pickupTime: e.target.value })} disabled={!user}>
                  {TIMES.map(t => <option key={t} value={t}>{t} น.</option>)}
                </select>
              </div>
            </div>
          </div>

          <h3 className="section-heading">🥩 เลือกสินค้า</h3>
          <div className="product-grid">
            {products.map(p => (
              <div key={p.id} className="customer-product-card card">
                <div className="product-emoji">{p.image}</div>
                <div className="product-name">{p.name}</div>
                <div className="product-type">{p.type}</div>
                <div className="product-price">฿{p.price} / {p.unit}</div>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => setQty(p.id, (cart[p.id] || 0) - 1)}>−</button>
                  <span className="qty-display">{cart[p.id] || 0}</span>
                  <button className="qty-btn" onClick={() => setQty(p.id, (cart[p.id] || 0) + 1)}>+</button>
                </div>
              </div>
            ))}
          </div>

          {cartItems.length > 0 && (
            <div className="cart-summary card">
              <div className="cart-title">🛒 รายการที่เลือก</div>
              {cartItems.map((item, i) => (
                <div key={i} className="cart-row">
                  <span>{item.name} × {item.qty}</span>
                  <span>฿{item.qty * item.price}</span>
                </div>
              ))}
              <div className="cart-total">รวม: ฿{total.toLocaleString()}</div>
              
              {/* 🌟 เปลี่ยนหน้าตาปุ่มยืนยัน ถ้ายังไม่ล็อกอินให้เป็นสีเทาๆ */}
              <button 
                className="btn-primary full-width" 
                onClick={handleReview} 
                disabled={loading}
                style={!user ? { backgroundColor: 'var(--bg3)', color: 'var(--text3)', cursor: 'not-allowed' } : {}}
              >
                {!user ? '🔒 เข้าสู่ระบบเพื่อสั่งจอง' : (loading ? 'กำลังตรวจสอบ...' : '→ ตรวจสอบและจอง')}
              </button>
            </div>
          )}
        </>
      )}

      {step === 2 && (
        <div className="review-box card">
          <h3>📋 ตรวจสอบการจอง</h3>

          {stockCheck && !stockCheck.ok && (
            <div className="alert alert-error">
              ⚠️ สินค้าต่อไปนี้ไม่เพียงพอในวันที่เลือก:
              <ul>{stockCheck.insufficient.map((item, i) => (
                <li key={i}>{item.name} (ต้องการ {item.qty}, มี {stockCheck.available[item.productId] || 0})</li>
              ))}</ul>
            </div>
          )}

          {stockCheck?.ok && <div className="alert alert-success">✅ สินค้ามีเพียงพอ พร้อมยืนยัน</div>}

          <div className="review-info">
            <div>👤 {form.name} | 📞 {form.phone}</div>
            <div>📅 {form.pickupDate} ⏰ {form.pickupTime} น.</div>
          </div>
          <div className="review-items">
            {cartItems.map((item, i) => (
              <div key={i} className="cart-row">
                <span>{item.name} × {item.qty}</span>
                <span>฿{item.qty * item.price}</span>
              </div>
            ))}
            <div className="cart-total">รวมทั้งสิ้น: ฿{total.toLocaleString()}</div>
          </div>
          <div className="form-actions">
            {stockCheck?.ok && (
              <button className="btn-primary" onClick={handleConfirm} disabled={loading}>
                {loading ? 'กำลังบันทึก...' : '✅ ยืนยันการจอง'}
              </button>
            )}
            <button className="btn-secondary" onClick={() => setStep(1)}>← แก้ไข</button>
          </div>
        </div>
      )}
    </div>
  );
}