import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import * as api from '../services/api';

const EMPTY_FORM = { name: '', type: '', price: '', unit: '100g', status: 'available', stock: 0, image: '🥩' };
const EMOJIS = ['🥩', '🌶️', '🌿', '⭐', '🔥', '🍖', '🧂'];

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [stockDate, setStockDate] = useState('2026-03-25');
  const [dailyStock, setDailyStock] = useState({});
  const [tab, setTab] = useState('products');
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);
  useEffect(() => { if (tab === 'stock') loadStock(); }, [tab, stockDate]);

  const load = async () => setProducts(await api.getProducts());
  const loadStock = async () => setDailyStock(await api.getDailyStock(stockDate));

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 2500); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, price: Number(form.price), stock: Number(form.stock) };
    if (editId) {
      await api.updateProduct(editId, data);
      flash('✅ อัปเดตสินค้าเรียบร้อย');
    } else {
      await api.addProduct(data);
      flash('✅ เพิ่มสินค้าเรียบร้อย');
    }
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
    load();
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, type: p.type, price: p.price, unit: p.unit, status: p.status, stock: p.stock, image: p.image });
    setEditId(p.id);
    setShowForm(true);
    setTab('products');
  };

  const handleDelete = async (id) => {
    if (confirm('ยืนยันการลบสินค้า?')) {
      await api.deleteProduct(id);
      flash('🗑️ ลบสินค้าแล้ว');
      load();
    }
  };

  const handleStockChange = async (productId, qty) => {
    setDailyStock(prev => ({ ...prev, [productId]: Number(qty) }));
    await api.updateDailyStock(stockDate, productId, Number(qty));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">⚙️ จัดการระบบ Admin</h1>
        <p className="page-sub">จัดการสินค้าและสต็อกประจำวัน</p>
      </div>

      {msg && <div className="flash-msg">{msg}</div>}

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>📦 รายการสินค้า</button>
        <button className={`tab-btn ${tab === 'stock' ? 'active' : ''}`} onClick={() => setTab('stock')}>📊 จัดการสต็อกรายวัน</button>
      </div>

      {tab === 'products' && (
        <>
          <div className="section-bar">
            <span className="section-count">{products.length} รายการ</span>
            <button className="btn-primary" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(!showForm); }}>
              {showForm ? '✕ ปิด' : '+ เพิ่มสินค้าใหม่'}
            </button>
          </div>

          {showForm && (
            <form className="product-form card" onSubmit={handleSubmit}>
              <h3 className="form-title">{editId ? '✏️ แก้ไขสินค้า' : '➕ เพิ่มสินค้าใหม่'}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>ชื่อสินค้า</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ชื่อสินค้า" />
                </div>
                <div className="form-group">
                  <label>ประเภท</label>
                  <input required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="เช่น ธรรมดา, เผ็ด" />
                </div>
                <div className="form-group">
                  <label>ราคา (บาท)</label>
                  <input required type="number" min="1" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>หน่วย</label>
                  <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="100g" />
                </div>
                <div className="form-group">
                  <label>สต็อกเริ่มต้น</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>สถานะ</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="available">จำหน่าย</option>
                    <option value="out_of_stock">หมด</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>ไอคอน</label>
                <div className="emoji-picker">
                  {EMOJIS.map(e => (
                    <button type="button" key={e} className={`emoji-btn ${form.image === e ? 'selected' : ''}`} onClick={() => setForm({ ...form, image: e })}>{e}</button>
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">{editId ? '💾 บันทึกการแก้ไข' : '➕ เพิ่มสินค้า'}</button>
                <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditId(null); }}>ยกเลิก</button>
              </div>
            </form>
          )}

          <div className="product-grid">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </>
      )}

      {tab === 'stock' && (
        <div className="stock-section">
          <div className="stock-date-row">
            <label>เลือกวันที่:</label>
            <input type="date" value={stockDate} onChange={e => setStockDate(e.target.value)} className="date-input" />
          </div>
          <div className="stock-table card">
            <table className="simple-table">
              <thead>
                <tr><th>สินค้า</th><th>ประเภท</th><th>จำนวนพร้อมจำหน่าย</th><th>อัปเดต</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>{p.image} {p.name}</td>
                    <td>{p.type}</td>
                    <td>
                      <input
                        type="number" min="0"
                        value={dailyStock[p.id] ?? p.stock}
                        onChange={e => setDailyStock(prev => ({ ...prev, [p.id]: Number(e.target.value) }))}
                        className="stock-input"
                      />
                    </td>
                    <td>
                      <button className="btn-small" onClick={() => handleStockChange(p.id, dailyStock[p.id] ?? p.stock)}>
                        💾
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}