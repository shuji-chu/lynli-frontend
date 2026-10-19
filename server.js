const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 开启跨域，允许你的 Cloudflare 前端请求这个后端
app.use(cors());
app.use(express.json());

const DB = path.join(__dirname, 'db.json');

// 初始化 db.json（如果不存在）
if (!fs.existsSync(DB)) {
  fs.writeFileSync(DB, JSON.stringify({ orders: [] }, null, 2));
}

// 接收前端传来的订单
app.post('/api/orders', (req, res) => {
  const { items, name, phone, address } = req.body || {};
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: '购物车是空的' });
  }

  const order = {
    id: 'NO' + Date.now(),
    items,
    total: items.reduce((s, l) => s + (l.price * l.qty), 0),
    name,
    phone,
    address,
    status: '待付款',
    createdAt: new Date().toISOString()
  };
  
  try {
    const data = JSON.parse(fs.readFileSync(DB, 'utf8'));
    data.orders.unshift(order);
    fs.writeFileSync(DB, JSON.stringify(data, null, 2));
    
    // 返回成功信息给前端
    res.json({ ok: true, order });
  } catch (err) {
    res.status(500).json({ error: '订单保存失败' });
  }
});

// 测试接口（在浏览器打开后端网址能看到这句话）
app.get('/', (req, res) => {
  res.send('LYNLI Backend is Running Perfectly!');
});

// 启动服务
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});