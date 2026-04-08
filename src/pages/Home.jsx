import { useEffect, useState } from 'react';
import * as api from '../services/api';

const initialReviews = [
  { id: 1, name: 'พิมพ์ดาว', rating: 5, comment: 'แคบหมูกรอบมาก หอมเครื่องเทศสไตล์บ้านเรา ถูกใจทุกคนในครอบครัวเลยค่ะ!' },
  { id: 2, name: 'ต้น', rating: 4, comment: 'อร่อยจัดจ้าน แพ็กเกจสวย ส่งไว ถูกใจลูกค้าประจำมากครับ' },
  { id: 3, name: 'มะปราง', rating: 5, comment: 'ของแท้ครบเครื่อง รสชาติกลมกล่อม กินเพลินจนนั่งดูซีรีส์ไม่วางมือ' },
];

export default function Home({ setActivePage }) {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState(initialReviews);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [reviewSuccess, setReviewSuccess] = useState('');

  const promoDeals = [
    { id: 1, title: 'Combo ครอบครัว', description: 'แคบหมูกรอบ 3 รส พร้อมกระเทียมเจียวและซอสพิเศษ ลดทันที 20%', price: '259', tag: 'ลดสุดคุ้ม' },
    { id: 2, title: 'โปรเช้า-บ่าย', description: 'ชุดแคบหมู 2 ถุง พร้อมของแถมพิเศษ จัดส่งได้ทันที', price: '159', tag: 'สินค้าจำกัด' },
    { id: 3, title: 'จัดชุดของขวัญ', description: 'แพ็กของขวัญพร้อมโบว์ เหมาะสำหรับฝากผู้ใหญ่หรือจับฉลาก', price: '349', tag: 'พิเศษวันนี้' },
  ];

  useEffect(() => {
    api.getProducts().then(ps => setProducts(ps.filter(p => p.status === 'available').slice(0, 4)));
    const saved = window.localStorage.getItem('capmooReviews');
    if (saved) {
      setReviews(prev => [...prev, ...JSON.parse(saved)]);
    }
  }, []);

  const handleSubmitReview = (event) => {
    event.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) {
      return;
    }

    const review = {
      id: Date.now(),
      ...newReview,
    };

    const updated = [review, ...reviews];
    setReviews(updated);
    setReviewSuccess('ขอบคุณสำหรับรีวิว! เราเก็บข้อมูลให้เรียบร้อยแล้ว');
    window.localStorage.setItem('capmooReviews', JSON.stringify(updated.filter(r => r.id > 3)));
    setNewReview({ name: '', rating: 5, comment: '' });

    setTimeout(() => setReviewSuccess(''), 3500);
  };

  return (
    <div className="page">
      <div className="home-hero card">
        <div>
          <div className="hero-eyebrow">CAPMOO</div>
          <h1 className="hero-title">แคบหมูกรอบสดใหม่ จากครัวบ้านเรา</h1>
          <p className="hero-copy">สั่งออนไลน์ได้ง่าย ด่วน รวดเร็ว พร้อมบริการรับที่ร้านหรือจัดส่งถึงบ้าน พร้อมโปรโมชั่นพิเศษสำหรับลูกค้าทุกคน</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => setActivePage('customer')}>สั่งจองออนไลน์</button>
            <button className="btn-secondary" onClick={() => setActivePage('contact')}>ติดต่อเรา</button>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-badge">🔥 โปรโมชั่นประจำวัน</div>
          <div className="hero-product">แคบหมูกรอบเผ็ด</div>
          <div className="hero-product">แคบหมูหมักสมุนไพร</div>
          <div className="hero-product">แคบหมูกรอบธรรมดา</div>
        </div>
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon">📦</div>
          <h3>สั่งง่ายใน 3 ขั้นตอน</h3>
          <p>เลือกสินค้า กรอกข้อมูล แล้วยืนยันการสั่งซื้อได้ทันที</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⏱️</div>
          <h3>จัดส่งเร็วทันใจ</h3>
          <p>รับที่ร้านหรือจัดส่งถึงบ้านตามเวลาที่คุณเลือก</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💳</div>
          <h3>ระบบ POS พร้อมใช้งาน</h3>
          <p>รองรับการขายหน้าร้านและการจัดการออเดอร์ในที่เดียว</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌟</div>
          <h3>รีวิวจากลูกค้า</h3>
          <p>อ่านรีวิวจริง และเขียนความประทับใจของคุณได้ที่นี่</p>
        </div>
      </div>

      <div className="section-bar">
        <span className="section-count">โปรโมชั่นวันนี้</span>
        <button className="btn-secondary" onClick={() => setActivePage('customer')}>ดูรายการโปรโมชั่น</button>
      </div>
      <div className="bundle-grid">
        {promoDeals.map(item => (
          <div key={item.id} className="bundle-card">
            <span className="bundle-tag">{item.tag}</span>
            <div className="bundle-title">{item.title}</div>
            <div className="bundle-desc">{item.description}</div>
            <div className="bundle-price">฿{item.price}</div>
            <button className="btn-primary" onClick={() => setActivePage('customer')}>สั่งเลย</button>
          </div>
        ))}
      </div>

      <div className="section-bar">
        <span className="section-count">สินค้าขายดี</span>
        <button className="btn-secondary" onClick={() => setActivePage('customer')}>ดูสินค้าทั้งหมด</button>
      </div>
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-emoji">{product.image}</div>
            <div className="product-name">{product.name}</div>
            <div className="product-type">{product.type}</div>
            <div className="product-meta">
              <span className="product-price">฿{product.price}</span>
              <span className="product-unit">/ {product.unit}</span>
            </div>
            <div className={`stock-label ${product.stock <= 5 ? 'low' : ''}`}>{product.stock <= 5 ? 'เหลือน้อย' : `สต็อก ${product.stock}`}</div>
          </div>
        ))}
      </div>

      <div className="section-heading">รีวิวจากลูกค้าจริง</div>
      <div className="review-grid">
        {reviews.slice(0, 6).map(review => (
          <div key={review.id} className="review-card">
            <div className="review-stars">{Array.from({ length: review.rating }).map((_, index) => '⭐')}</div>
            <div className="review-author">{review.name}</div>
            <div className="review-comment">{review.comment}</div>
          </div>
        ))}
      </div>

      <div className="review-box">
        <h3>ส่งรีวิวของคุณ</h3>
        {reviewSuccess && <div className="alert alert-success">{reviewSuccess}</div>}
        <form className="review-form" onSubmit={handleSubmitReview}>
          <div className="form-grid">
            <div className="form-group">
              <label>ชื่อของคุณ</label>
              <input
                value={newReview.name}
                onChange={(event) => setNewReview(prev => ({ ...prev, name: event.target.value }))}
                placeholder="เช่น สมชาย"
              />
            </div>
            <div className="form-group">
              <label>คะแนน</label>
              <select
                value={newReview.rating}
                onChange={(event) => setNewReview(prev => ({ ...prev, rating: Number(event.target.value) }))}
              >
                {[5, 4, 3, 2, 1].map(value => (
                  <option key={value} value={value}>{value} ดาว</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>ความเห็นของคุณ</label>
            <textarea
              value={newReview.comment}
              onChange={(event) => setNewReview(prev => ({ ...prev, comment: event.target.value }))}
              placeholder="เขียนรีวิวสั้น ๆ ถึงความอร่อยของเรา"
            />
          </div>
          <button className="btn-primary" type="submit">ส่งรีวิว</button>
        </form>
      </div>
    </div>
  );
}
