import { useState } from 'react';

export default function Register({ setActivePage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    
    if (!username || !password || !confirmPassword) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (password !== confirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน กรุณาลองใหม่อีกครั้ง');
      return;
    }

    // --- ส่วนที่เพิ่มเข้ามา: บันทึกข้อมูลลง localStorage ---
    // 1. ดึงข้อมูลผู้ใช้เก่าออกมาจากระบบก่อน (ถ้าไม่มีให้เป็น Array ว่าง [])
    const existingUsers = JSON.parse(localStorage.getItem('capmoo_users')) || [];

    // 2. เช็คว่ามี Username นี้ในระบบหรือยัง
    const userExists = existingUsers.some(user => user.username === username);
    if (userExists) {
      alert('Username นี้มีคนใช้แล้ว กรุณาตั้งชื่ออื่นครับ');
      return;
    }

    // 3. สร้างข้อมูลผู้ใช้ใหม่ (ให้สิทธิ์เป็น 'customer' อัตโนมัติ)
    const newUser = {
      username: username,
      password: password,
      role: 'customer'
    };

    // 4. บันทึกข้อมูลรวมกันกลับลงไปใน localStorage
    existingUsers.push(newUser);
    localStorage.setItem('capmoo_users', JSON.stringify(existingUsers));

    alert(`สมัครสมาชิกสำเร็จ! ยินดีต้อนรับคุณ ${username}`);
    
    // สมัครเสร็จปุ๊บ สลับไปหน้า Login ทันที
    setActivePage('login'); 
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', background: '#222', borderRadius: '10px', color: 'white', textAlign: 'center' }}>
      <h2>📝 สมัครสมาชิกใหม่</h2>
      <p style={{ color: '#aaa', marginBottom: '20px' }}>สร้างบัญชีเพื่อใช้งานระบบ CAPMOO POS</p>
      
      <form onSubmit={handleRegister}>
        {/* ช่อง Input เหมือนเดิม */}
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="text" 
            placeholder="ตั้งชื่อผู้ใช้งาน (Username)" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#333', color: 'white' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="password" 
            placeholder="ตั้งรหัสผ่าน (Password)" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#333', color: 'white' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="password" 
            placeholder="ยืนยันรหัสผ่านอีกครั้ง" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#333', color: 'white' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#F5A623', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
          สมัครสมาชิก
        </button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '14px', color: '#aaa' }}>
        มีบัญชีอยู่แล้ว?{' '}
        <span 
          style={{ color: '#F5A623', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => setActivePage('login')}
        >
          เข้าสู่ระบบที่นี่
        </span>
      </p>
    </div>
  );
}