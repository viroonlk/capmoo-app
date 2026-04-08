import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // 1. นำเข้า Context ที่เราสร้างไว้

// 2. เพิ่ม property 'requireAdmin' เข้าไปเพื่อบอกว่าเมนูไหนต้องใช้สิทธิ์แอดมิน
const NAV_ITEMS = [
  { key: 'home', label: 'หน้าแรก', icon: '🏠', desc: 'Home', requireAdmin: false },
  { key: 'customer', label: 'สั่งจองออนไลน์', icon: '📱', desc: 'Customer', requireAdmin: false },
  { key: 'pos', label: 'ขายหน้าร้าน', icon: '🛒', desc: 'POS', requireAdmin: false },
  { key: 'contact', label: 'ติดต่อเรา', icon: '📞', desc: 'Contact', requireAdmin: false },
  { key: 'admin', label: 'จัดการสินค้า', icon: '⚙️', desc: 'Admin', requireAdmin: true },
  { key: 'orders', label: 'ออเดอร์ทั้งหมด', icon: '📋', desc: 'Orders', requireAdmin: true },
];

export default function Navbar({ activePage, setActivePage }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth(); // 3. ดึงข้อมูล user และฟังก์ชัน logout มาใช้

  // 4. กรองเมนูก่อนแสดงผล: ถ้าไม่ได้ล็อกอิน หรือไม่ใช่ admin จะเห็นแค่เมนูที่ requireAdmin เป็น false
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.requireAdmin) {
      return user?.role === 'admin';
    }
    return true; 
  });

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🐷</span>
        <div>
          <div className="brand-name">แคบหมูกรอบ</div>
          <div className="brand-sub">CAPMOO POS SYSTEM</div>
        </div>
      </div>

      <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
        {/* 5. Map ข้อมูลจาก Array ที่กรองแล้ว (filteredNavItems) แทน NAV_ITEMS ตัวเต็ม */}
        {filteredNavItems.map(item => (
          <button
            key={item.key}
            className={`nav-btn ${activePage === item.key ? 'active' : ''}`}
            onClick={() => { setActivePage(item.key); setMobileOpen(false); }}
          >
            <span className="nav-icon">{item.icon}</span>
            <div>
              <div className="nav-label">{item.label}</div>
              <div className="nav-desc">{item.desc}</div>
            </div>
          </button>
        ))}

        {/* 6. เพิ่มส่วนของปุ่ม Login / Logout ให้เข้ากับสไตล์ Navbar ของคุณ */}
        <div className="nav-divider" style={{ borderLeft: '1px solid #444', margin: '0 10px' }}></div>
        
        {user ? (
          <button className="nav-btn" onClick={() => { logout(); setActivePage('customer'); }}>
            <span className="nav-icon">🚪</span>
            <div>
              <div className="nav-label">ออกจากระบบ</div>
              <div className="nav-desc">{user.username}</div>
            </div>
          </button>
        ) : (
          <button className={`nav-btn ${activePage === 'login' ? 'active' : ''}`} onClick={() => { setActivePage('login'); setMobileOpen(false); }}>
            <span className="nav-icon">🔑</span>
            <div>
              <div className="nav-label">เข้าสู่ระบบ</div>
              <div className="nav-desc">Login</div>
            </div>
          </button>
        )}
      </div>

      <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? '✕' : '☰'}
      </button>
    </nav>
  );
}