const STATUS_MAP = {
  confirmed: { label: 'รับออเดอร์แล้ว', cls: 'st-confirmed' },
  preparing: { label: 'กำลังเตรียม', cls: 'st-preparing' },
  ready: { label: 'พร้อมส่ง', cls: 'st-ready' },
  completed: { label: 'เสร็จสิ้น', cls: 'st-completed' },
  cancelled: { label: 'ยกเลิก', cls: 'st-cancelled' },
};

export default function OrderTable({ orders, onStatusChange }) {
  if (!orders.length) {
    return <div className="empty-state">📭 ไม่มีออเดอร์ในขณะนี้</div>;
  }

  return (
    <div className="order-table-wrap">
      <table className="order-table">
        <thead>
          <tr>
            <th>คิว</th>
            <th>รหัสออเดอร์</th>
            <th>ช่องทาง</th>
            <th>ลูกค้า</th>
            <th>รายการ</th>
            <th>รับสินค้า</th>
            <th>ยอดรวม</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => {
            const st = STATUS_MAP[order.status] || { label: order.status, cls: '' };
            return (
              <tr key={order.id} className={`order-row ${order.type}`}>
                <td className="packing-queue">#{order.packingOrder}</td>
                <td className="order-id">{order.id}</td>
                <td>
                  <span className={`channel-badge ${order.type}`}>
                    {order.type === 'online' ? '🌐 ออนไลน์' : '🏪 หน้าร้าน'}
                  </span>
                </td>
                <td>
                  <div className="customer-name">{order.customerName}</div>
                  <div className="customer-phone">{order.phone}</div>
                </td>
                <td>
                  <ul className="item-list">
                    {order.items.map((item, i) => (
                      <li key={i}>{item.name} × {item.qty}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <div>{order.pickupDate}</div>
                  <div className="pickup-time">{order.pickupTime}</div>
                </td>
                <td className="order-total">฿{order.total.toLocaleString()}</td>
                <td><span className={`status-pill ${st.cls}`}>{st.label}</span></td>
                <td>
                  <select
                    className="status-select"
                    value={order.status}
                    onChange={e => onStatusChange(order.id, e.target.value)}
                  >
                    <option value="confirmed">รับออเดอร์แล้ว</option>
                    <option value="preparing">กำลังเตรียม</option>
                    <option value="ready">พร้อมส่ง</option>
                    <option value="completed">เสร็จสิ้น</option>
                    <option value="cancelled">ยกเลิก</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}