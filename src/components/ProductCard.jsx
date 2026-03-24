export default function ProductCard({ product, onEdit, onDelete, showActions = true }) {
  const statusLabel = product.status === 'available' ? 'จำหน่าย' : 'หมด';
  const statusClass = product.status === 'available' ? 'status-available' : 'status-out';
 
  return (
    <div className={`product-card ${product.status === 'out_of_stock' ? 'dimmed' : ''}`}>
      <div className="product-emoji">{product.image}</div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-type">ประเภท: {product.type}</div>
        <div className="product-meta">
          <span className="product-price">฿{product.price}</span>
          <span className="product-unit">/ {product.unit}</span>
        </div>
        <div className="product-stock-row">
          <span className="stock-label">สต็อก:</span>
          <span className={`stock-value ${product.stock <= 5 ? 'low' : ''}`}>{product.stock}</span>
        </div>
        <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
      </div>
      {showActions && (
        <div className="product-actions">
          <button className="btn-edit" onClick={() => onEdit(product)}>✏️ แก้ไข</button>
          <button className="btn-delete" onClick={() => onDelete(product.id)}>🗑️ ลบ</button>
        </div>
      )}
    </div>
  );
}
 