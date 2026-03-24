// Mock data store (simulates a backend database)
let products = [
  { id: 1, name: 'แคบหมูกรอบธรรมดา', type: 'ธรรมดา', price: 80, unit: '100g', status: 'available', stock: 50, image: '🥩' },
  { id: 2, name: 'แคบหมูกรอบเผ็ด', type: 'เผ็ด', price: 90, unit: '100g', status: 'available', stock: 30, image: '🌶️' },
  { id: 3, name: 'แคบหมูหมักสมุนไพร', type: 'สมุนไพร', price: 100, unit: '100g', status: 'available', stock: 20, image: '🌿' },
  { id: 4, name: 'แคบหมูกรอบขนาดใหญ่', type: 'ธรรมดา', price: 150, unit: '200g', status: 'available', stock: 15, image: '🥩' },
  { id: 5, name: 'แคบหมูรสออริจินัล', type: 'ออริจินัล', price: 85, unit: '100g', status: 'out_of_stock', stock: 0, image: '⭐' },
];

let orders = [
  {
    id: 'ORD-001', type: 'online', customerName: 'คุณสมชาย', phone: '081-234-5678',
    items: [{ productId: 1, name: 'แคบหมูกรอบธรรมดา', qty: 2, price: 80 }],
    pickupDate: '2026-03-25', pickupTime: '10:00', total: 160,
    status: 'confirmed', createdAt: '2026-03-24T08:00:00', packingOrder: 1
  },
  {
    id: 'ORD-002', type: 'walkin', customerName: 'ลูกค้าหน้าร้าน', phone: '-',
    items: [
      { productId: 2, name: 'แคบหมูกรอบเผ็ด', qty: 1, price: 90 },
      { productId: 3, name: 'แคบหมูหมักสมุนไพร', qty: 1, price: 100 }
    ],
    pickupDate: '2026-03-24', pickupTime: 'ทันที', total: 190,
    status: 'completed', createdAt: '2026-03-24T09:30:00', packingOrder: 2
  },
];

let dailyStock = {
  '2026-03-25': { 1: 40, 2: 25, 3: 15, 4: 10, 5: 0 },
  '2026-03-26': { 1: 50, 2: 30, 3: 20, 4: 15, 5: 0 },
};

let nextOrderId = 3;

// Products API
export const getProducts = () => Promise.resolve([...products]);

export const addProduct = (product) => {
  const newProduct = { ...product, id: Date.now() };
  products.push(newProduct);
  return Promise.resolve(newProduct);
};

export const updateProduct = (id, updates) => {
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return Promise.reject('Product not found');
  products[idx] = { ...products[idx], ...updates };
  return Promise.resolve(products[idx]);
};

export const deleteProduct = (id) => {
  products = products.filter(p => p.id !== id);
  return Promise.resolve(true);
};

// Stock API
export const getDailyStock = (date) => {
  if (!dailyStock[date]) {
    dailyStock[date] = products.reduce((acc, p) => ({ ...acc, [p.id]: p.stock }), {});
  }
  return Promise.resolve({ ...dailyStock[date] });
};

export const updateDailyStock = (date, productId, qty) => {
  if (!dailyStock[date]) dailyStock[date] = {};
  dailyStock[date][productId] = qty;
  return Promise.resolve(dailyStock[date]);
};

export const checkStock = (date, items) => {
  const stock = dailyStock[date] || products.reduce((acc, p) => ({ ...acc, [p.id]: p.stock }), {});
  const reserved = orders
    .filter(o => o.pickupDate === date && o.status !== 'cancelled' && o.status !== 'completed')
    .reduce((acc, o) => {
      o.items.forEach(item => { acc[item.productId] = (acc[item.productId] || 0) + item.qty; });
      return acc;
    }, {});
  const available = {};
  products.forEach(p => {
    available[p.id] = (stock[p.id] || 0) - (reserved[p.id] || 0);
  });
  const insufficient = items.filter(item => available[item.productId] < item.qty);
  return Promise.resolve({ available, insufficient, ok: insufficient.length === 0 });
};

// Orders API
export const getOrders = () => Promise.resolve([...orders]);

export const createOrder = async (orderData) => {
  const id = `ORD-${String(nextOrderId++).padStart(3, '0')}`;
  const packingOrder = orders.filter(o => o.pickupDate === orderData.pickupDate).length + 1;
  const newOrder = { ...orderData, id, status: 'confirmed', createdAt: new Date().toISOString(), packingOrder };
  orders.push(newOrder);
  // Auto deduct stock for walk-in
  if (orderData.type === 'walkin') {
    orderData.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) product.stock = Math.max(0, product.stock - item.qty);
    });
  }
  return Promise.resolve(newOrder);
};

export const updateOrderStatus = (id, status) => {
  const order = orders.find(o => o.id === id);
  if (!order) return Promise.reject('Order not found');
  order.status = status;
  if (status === 'completed' && order.type === 'online') {
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) product.stock = Math.max(0, product.stock - item.qty);
    });
  }
  return Promise.resolve(order);
};

export const getStats = () => {
  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0);
  const todayOrders = orders.filter(o => o.createdAt?.startsWith('2026-03-24'));
  const onlineOrders = orders.filter(o => o.type === 'online');
  const walkinOrders = orders.filter(o => o.type === 'walkin');
  return Promise.resolve({ totalRevenue, todayOrders: todayOrders.length, onlineOrders: onlineOrders.length, walkinOrders: walkinOrders.length, totalOrders: orders.length });
};