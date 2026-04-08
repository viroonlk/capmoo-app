import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const PROMO_CODES = {
  CAPMOO50: { description: 'ลด 50 บาท เมื่อสั่งครบ 500 บาท', discount: 50, minTotal: 500 },
  CAPMOO10: { description: 'ลด 10% เมื่อสั่งครบ 300 บาท', discountPct: 0.1, minTotal: 300 },
};

// 🌟 รับ setActivePage มาเป็น Prop เพื่อสั่งเปลี่ยนไปหน้า login ได้
export default function Customer({ setActivePage }) {
  const { user } = useAuth(); 
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  
  // 🌟 เพิ่ม deliveryMethod และ address ใน State
  const [form, setForm] = useState({ 
    name: user?.username || '', 
    phone: '', 
    deliveryMethod: 'pickup', // ค่าเริ่มต้นคือรับที่ร้าน (pickup) หรือจัดส่ง (delivery)
    address: '', 
    pickupDate: '', 
    pickupTime: '09:00' 
  });
  
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
  const finalTotal = Math.max(0, total - discount);
  const productTypes = ['all', ...Array.from(new Set(products.map(p => p.type)))];

  const visibleProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    const promo = PROMO_CODES[code];
    if (!promo) {
      setPromoMessage('โค้ดไม่ถูกต้อง ลองใหม่อีกครั้ง');
      setDiscount(0);
      setAppliedPromo(null);
      return;
    }

    if (total < promo.minTotal) {
      setPromoMessage(`โค้ดนี้ต้องสั่งขั้นต่ำ ${promo.minTotal} บาท`);
      setDiscount(0);
      setAppliedPromo(null);
      return;
    }

    const calculated = promo.discountPct ? Math.round(total * promo.discountPct) : promo.discount;
    setDiscount(calculated);
    setAppliedPromo(code);
    setPromoMessage(`ใช้โค้ด ${code} แล้ว ลดทันที ${calculated} บาท`);
  };

  const setQty = (id, qty) => setCart(prev => ({ ...prev, [id]: Math.max(0, qty) }));

  const handleReview = async () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งจองครับ');
      if (setActivePage) setActivePage('login');
      return;
    }

    if (!cartItems.length) return alert('กรุณาเลือกสินค้า');
    if (!form.name || !form.phone || !form.pickupDate) return alert('กรุณากรอกข้อมูลให้ครบ');
    
    // 🌟 ดักจับบังคับกรอกที่อยู่หากเลือกจัดส่ง
    if (form.deliveryMethod === 'delivery' && !form.address.trim()) {
      return alert('กรุณากรอกที่อยู่ในการจัดส่งให้ครบถ้วน');
    }
    
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
      deliveryMethod: form.deliveryMethod, // 🌟 ส่งข้อมูลรูปแบบการรับไปให้ API
      address: form.deliveryMethod === 'delivery' ? form.address : '', // 🌟 ส่งที่อยู่ไปด้วย
      items: cartItems,
      pickupDate: form.pickupDate,
      pickupTime: form.pickupTime,
      total: finalTotal,
      discount,
      promoCode: appliedPromo || ''
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
        <h2>สั่งซื้อสำเร็จ!</h2>
        <p className="confirm-id">รหัสออเดอร์: <strong>{order.id}</strong></p>
        <div className="confirm-detail">
          <div>👤 {form.name} | 📞 {form.phone}</div>
          
          {/* 🌟 แสดงข้อมูลในหน้า Success ตามประเภทที่เลือก */}
          {order.deliveryMethod === 'delivery' ? (
            <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
              🚚 จัดส่งไปที่: {order.address} <br/>
              📅 รอบส่ง: {order.pickupDate} ⏰ {order.pickupTime} น.
            </div>
          ) : (
            <div>📅 รับที่ร้านวันที่: {order.pickupDate} ⏰ {order.pickupTime} น.</div>
          )}
          
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
        <p className="page-sub">เลือกสินค้าแคปหมูและรูปแบบการจัดส่งได้เลย</p>
      </div>

      <div className="promo-card">
        <div className="promo-icon">🔥</div>
        <div>
          <div className="promo-title">โปรโมชั่นแคบหมู</div>
          <p>สั่งครบ 500 บาท ลดทันที 50 บาท และรับโค้ด CAPMOO10 ลด 10% เมื่อสั่งครบ 300 บาท</p>
        </div>
      </div>

      <div className="search-bar card">
        <input
          type="search"
          placeholder="ค้นหาแคบหมู, รส, หรือประเภท"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          {productTypes.map(type => (
            <option key={type} value={type}>{type === 'all' ? 'ดูสินค้าทั้งหมด' : type}</option>
          ))}
        </select>
        <button type="button" className="btn-small" onClick={() => { setSearchQuery(''); setFilterType('all'); }}>
          ล้าง
        </button>
      </div>

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
          {/* ... โค้ดส่วนแสดงออเดอร์ (เหมือนเดิม) ... */}
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
                    {order.deliveryMethod === 'delivery' ? 'จัดส่ง:' : 'รับเอง:'} {order.pickupTime} น.
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
            <h3>📋 ข้อมูลผู้สั่งจองและการจัดส่ง</h3>
            <div className="form-grid">
              
              <div className="form-group">
                <label>ชื่อ-นามสกุล</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ชื่อของคุณ" disabled={!user} />
              </div>
              
              <div className="form-group">
                <label>เบอร์โทร</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="08x-xxx-xxxx" disabled={!user} />
              </div>
              
              {/* 🌟 เพิ่มตัวเลือกรูปแบบการรับสินค้า */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>รูปแบบการรับสินค้า</label>
                <select value={form.deliveryMethod} onChange={e => setForm({ ...form, deliveryMethod: e.target.value })} disabled={!user} style={{ width: '100%', padding: '10px', borderRadius: '8px' }}>
                  <option value="pickup">🏠 มารับเองที่ร้าน</option>
                  <option value="delivery">🚚 จัดส่งตามที่อยู่ (ไปรษณีย์/ขนส่ง)</option>
                </select>
              </div>

              {/* 🌟 ถ้าเลือก "จัดส่ง" ให้แสดงช่องกรอกที่อยู่แบบเต็มบรรทัด */}
              {form.deliveryMethod === 'delivery' && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>ที่อยู่ในการจัดส่ง <span style={{ color: 'red' }}>*</span></label>
                  <textarea 
                    value={form.address} 
                    onChange={e => setForm({ ...form, address: e.target.value })} 
                    placeholder="บ้านเลขที่, หมู่, ซอย, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์" 
                    disabled={!user}
                    rows="3"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg2)', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                </div>
              )}

              <div className="form-group">
                <label>{form.deliveryMethod === 'delivery' ? 'วันที่ต้องการให้จัดส่ง' : 'วันที่รับสินค้า'}</label>
                <input type="date" value={form.pickupDate} min={new Date().toISOString().split('T')[0]} onChange={e => setForm({ ...form, pickupDate: e.target.value })} className="date-input" disabled={!user} />
              </div>
              
              <div className="form-group">
                <label>{form.deliveryMethod === 'delivery' ? 'รอบเวลาจัดส่ง' : 'เวลารับสินค้า'}</label>
                <select value={form.pickupTime} onChange={e => setForm({ ...form, pickupTime: e.target.value })} disabled={!user}>
                  {TIMES.map(t => <option key={t} value={t}>{t} น.</option>)}
                </select>
              </div>

            </div>
          </div>

          <h3 className="section-heading">🥩 เลือกสินค้า</h3>
          <div className="product-grid">
            {visibleProducts.length === 0 ? (
              <div className="empty-state">ไม่พบสินค้าในระบบตามเงื่อนไขที่เลือก</div>
            ) : visibleProducts.map(p => (
              <div key={p.id} className="customer-product-card card">
                <div className="product-emoji">{p.image}</div>
                <div className="product-name">{p.name}</div>
                <div className="product-type">{p.type}</div>
                <div className="product-price">฿{p.price} / {p.unit}</div>
                <div className={`stock-label ${p.stock <= 5 ? 'low' : ''}`}>
                  {p.stock <= 5 ? 'เหลือน้อย' : `สต็อก ${p.stock}`}
                </div>
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

              <div className="promo-row">
                <input
                  type="text"
                  value={promoCode}
                  placeholder="ใส่โค้ดส่วนลด เช่น CAPMOO50"
                  onChange={e => setPromoCode(e.target.value)}
                />
                <button type="button" className="btn-secondary" onClick={handleApplyPromo}>ใช้โค้ด</button>
              </div>

              {promoMessage && (
                <div className={`alert ${appliedPromo ? 'alert-success' : 'alert-error'}`}>
                  {promoMessage}
                </div>
              )}

              <div className="cart-total">รวม: ฿{total.toLocaleString()}</div>
              {discount > 0 && (
                <div className="cart-total" style={{ color: 'var(--success)' }}>
                  ลดแล้ว: -฿{discount.toLocaleString()} 
                </div>
              )}
              <div className="cart-total" style={{ fontSize: '20px' }}>
                ยอดสุทธิ: ฿{finalTotal.toLocaleString()}
              </div>
              
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

          <div className="review-info" style={{ background: 'var(--bg2)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <div><strong>👤 ชื่อ:</strong> {form.name} | <strong>📞 โทร:</strong> {form.phone}</div>
            <div style={{ marginTop: '8px' }}>
              <strong>📦 รูปแบบ:</strong> {form.deliveryMethod === 'delivery' ? '🚚 จัดส่ง' : '🏠 รับที่ร้าน'}
            </div>
            
            {/* 🌟 แสดงที่อยู่ถ้าเป็นการจัดส่ง */}
            {form.deliveryMethod === 'delivery' && (
              <div style={{ marginTop: '8px', color: 'var(--primary)' }}>
                <strong>📍 ที่อยู่จัดส่ง:</strong> {form.address}
              </div>
            )}
            
            <div style={{ marginTop: '8px' }}>
              <strong>📅 วันที่:</strong> {form.pickupDate} <strong>⏰ เวลา:</strong> {form.pickupTime} น.
            </div>
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
                {loading ? 'กำลังบันทึก...' : '✅ ยืนยันคำสั่งซื้อ'}
              </button>
            )}
            <button className="btn-secondary" onClick={() => setStep(1)}>← แก้ไขข้อมูล</button>
          </div>
        </div>
      )}
    </div>
  );
}