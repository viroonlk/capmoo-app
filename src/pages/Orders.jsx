import { useState, useEffect } from 'react';
import OrderTable from '../components/OrderTable';
import * as api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [packingView, setPackingView] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [o, s] = await Promise.all([api.getOrders(), api.getStats()]);
    setOrders(o);
    setStats(s);
  };

  const handleStatusChange = async (id, status) => {
    await api.updateOrderStatus(id, status);
    load();
  };

  const filtered = orders
    .filter(o => filter === 'all' || o.type === filter || o.status === filter)
    .filter(o => !dateFilter || o.pickupDate === dateFilter)
    .sort((a, b) => packingView ? a.packingOrder - b.packingOrder : new Date(b.createdAt) - new Date(a.createdAt));

  const pendingPacking = orders.filter(o => ['confirmed', 'preparing'].includes(o.status)).length;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📋 จัดการออเดอร์</h1>
        <p className="page-sub">รายการสั่งซื้อออนไลน์และหน้าร้านทั้งหมด</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{stats.totalOrders || 0}</div>
          <div className="stat-label">ออเดอร์ทั้งหมด</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌐</div>
          <div className="stat-value">{stats.onlineOrders || 0}</div>
          <div className="stat-label">ออนไลน์</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-value">{stats.walkinOrders || 0}</div>
          <div className="stat-label">หน้าร้าน</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon">💰</div>
          <div className="stat-value">฿{(stats.totalRevenue || 0).toLocaleString()}</div>
          <div className="stat-label">รายได้รวม</div>
        </div>
        <div className="stat-card warn">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{pendingPacking}</div>
          <div className="stat-label">รอเตรียมสินค้า</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          {['all', 'online', 'walkin', 'confirmed', 'preparing', 'completed'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'ทั้งหมด' : f === 'online' ? '🌐 ออนไลน์' : f === 'walkin' ? '🏪 หน้าร้าน' : f === 'confirmed' ? 'ยืนยันแล้ว' : f === 'preparing' ? 'เตรียมสินค้า' : 'เสร็จสิ้น'}
            </button>
          ))}
        </div>
        <div className="filter-right">
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="date-input" placeholder="กรองวันที่" />
          {dateFilter && <button className="btn-small" onClick={() => setDateFilter('')}>✕</button>}
          <button
            className={`btn-small ${packingView ? 'active' : ''}`}
            onClick={() => setPackingView(!packingView)}
            title="เรียงตามคิวเตรียมสินค้า"
          >
            📦 {packingView ? 'คิว Packing' : 'เรียงตามคิว'}
          </button>
        </div>
      </div>

      {packingView && (
        <div className="packing-banner">
          📦 โหมดจัดลำดับคิว Packing — เรียงตามลำดับการรับสินค้า
        </div>
      )}

      <OrderTable orders={filtered} onStatusChange={handleStatusChange} />
    </div>
  );
}