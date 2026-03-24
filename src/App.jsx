import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext'; // ดึง Context มาใช้
import Navbar from './components/Navbar';
import Admin from './pages/Admin';
import Customer from './pages/Customer';
import Pos from './pages/pos';
import Orders from './pages/Orders';
import Login from './pages/Login'; // เพิ่มหน้า Login
import Register from './pages/Register';
import './App.css';

export default function App() {
  // เปลี่ยนค่าเริ่มต้นเป็น 'customer' เพื่อไม่ให้ติดหน้า admin ตอนเพิ่งเปิดแอป
  const [activePage, setActivePage] = useState('customer');
  const { user } = useAuth();

  // ดักจับการเปลี่ยนหน้า: ถ้าจะเข้า admin/orders แต่สิทธิ์ไม่ใช่ admin ให้เตะไปหน้า login
  useEffect(() => {
    const requiresAdmin = ['admin', 'orders'];
    if (requiresAdmin.includes(activePage) && user?.role !== 'admin') {
      setActivePage('login');
    }
  }, [activePage, user]);

  // เพิ่มหน้า login เข้าไปใน pages
const pages = { 
    admin: Admin, 
    customer: Customer, 
    pos: Pos, 
    orders: Orders,
    login: Login,
    register: Register // เพิ่มบรรทัดนี้
  };
  
  const PageComponent = pages[activePage] || Customer;

  return (
    <div className="app">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main className="main-content">
        {/* ส่ง setActivePage ไปให้ทุกหน้า เผื่อต้องใช้เปลี่ยนหน้า (เช่น หน้า Login) */}
        <PageComponent setActivePage={setActivePage} />
      </main>
    </div>
  );
}