import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ setActivePage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // --- ส่วนที่ปรับปรุง: เช็คข้อมูล ---
    // 1. เช็คสิทธิ์ Admin ก่อน (อันนี้ Fix ไว้ให้ผู้ดูแลระบบ)
    if (username === 'admin' && password === '1234') {
      login({ username: 'Admin', role: 'admin' });
      setActivePage('admin'); // Admin ล็อกอินเสร็จไปหน้าจัดการสินค้า
      return; // จบการทำงานตรงนี้เลย
    }

    // 2. ถ้าไม่ใช่ Admin ให้ไปค้นหาบัญชีจากที่ลูกค้าสมัครไว้ใน localStorage
    const existingUsers = JSON.parse(localStorage.getItem('capmoo_users')) || [];
    
    // หาว่ามี user ที่ชื่อและรหัสผ่านตรงกับที่พิมพ์มาไหม
    const foundUser = existingUsers.find(
      (user) => user.username === username && user.password === password
    );

    if (foundUser) {
      // ถ้าเจอ แสดงว่าล็อกอินสำเร็จ
      login({ username: foundUser.username, role: foundUser.role });
      alert(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณ ${foundUser.username}`);
      setActivePage('customer'); // ลูกค้าทั่วไป ล็อกอินเสร็จให้ไปหน้าสั่งจอง
    } else {
      // ถ้าไม่เจอ หรือรหัสผิด
      alert('Username หรือ รหัสผ่านไม่ถูกต้อง! กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', background: '#222', borderRadius: '10px', color: 'white', textAlign: 'center' }}>
      <h2>🔒 เข้าสู่ระบบ</h2>
      <p style={{ color: '#aaa', marginBottom: '20px' }}>เข้าสู่ระบบเพื่อใช้งาน CAPMOO POS</p>
      
      <form onSubmit={handleLogin}>
        {/* ช่อง Input เหมือนเดิม */}
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="text" 
            placeholder="ชื่อผู้ใช้งาน (Username)" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#333', color: 'white' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="password" 
            placeholder="รหัสผ่าน (Password)" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#333', color: 'white' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#F5A623', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
          เข้าสู่ระบบ
        </button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '14px', color: '#aaa' }}>
        ยังไม่มีบัญชีใช่ไหม?{' '}
        <span 
          style={{ color: '#F5A623', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => setActivePage('register')}
        >
          สมัครสมาชิกเลย
        </span>
      </p>
    </div>
  );
}