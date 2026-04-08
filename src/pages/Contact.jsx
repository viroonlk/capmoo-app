import { useState } from 'react';

export default function Contact({ setActivePage }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    setStatus('ส่งข้อความเรียบร้อยแล้ว เจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุด');
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setStatus(''), 4000);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">ติดต่อเรา</h1>
        <p className="page-sub">สอบถามโปรโมชั่น สั่งซื้อ หรือแจ้งปัญหาได้ที่นี่</p>
      </div>

      <div className="contact-grid">
        <section className="contact-details">
          <h3>ข้อมูลร้าน</h3>
          <div className="contact-item"><strong>ที่อยู่:</strong> 88 ถนนอร่อย ซอยแคบหมู กรุงเทพฯ</div>
          <div className="contact-item"><strong>โทร:</strong> 02-123-4567</div>
          <div className="contact-item"><strong>อีเมล:</strong> support@capmoo.com</div>
          <div className="contact-item"><strong>เวลาทำการ:</strong> 09:00 - 20:00 น. ทุกวัน</div>
          <div className="contact-item"><strong>ช่องทาง:</strong> Facebook / LINE / Instagram</div>
          <div className="contact-item">หากต้องการสั่งด่วน สามารถกดปุ่มด้านล่างเพื่อกลับไปสั่งออนไลน์ได้ทันที</div>
          <button className="btn-primary" onClick={() => setActivePage('customer')}>สั่งแคบหมูเลย</button>
        </section>

        <section className="contact-form">
          <h3>ส่งข้อความหาเรา</h3>
          {status && <div className={`alert ${status.includes('เรียบร้อย') ? 'alert-success' : 'alert-error'}`}>{status}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>ชื่อ</label>
              <input
                value={form.name}
                onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
                placeholder="ชื่อของคุณ"
              />
            </div>
            <div className="form-group">
              <label>อีเมล</label>
              <input
                type="email"
                value={form.email}
                onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))}
                placeholder="example@mail.com"
              />
            </div>
            <div className="form-group">
              <label>ข้อความ</label>
              <textarea
                value={form.message}
                onChange={event => setForm(prev => ({ ...prev, message: event.target.value }))}
                placeholder="เขียนข้อความหรือสอบถามรายละเอียด..."
              />
            </div>
            <button className="btn-primary" type="submit">ส่งข้อความ</button>
          </form>
        </section>
      </div>
    </div>
  );
}
