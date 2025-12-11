# 📊 Dashboard API Endpoints

## Overview
Dashboard endpoints menyediakan data analytics dan statistics untuk admin panel, termasuk revenue charts, order statistics, top products, dan recent orders.

**Base URL**: `http://localhost:8081/api/dashboard`
**Authentication**: Admin role required

---

## 🔐 Authentication Required
Semua endpoint dashboard memerlukan:
```http
Authorization: Bearer <admin_token>
```

---

## 📈 1. Dashboard Overview

### GET `/api/dashboard/overview`
Mendapatkan ringkasan lengkap dashboard dengan semua statistik utama.

**Parameters:**
- `fromDate` (optional): Format `YYYY-MM-DD`, default 30 hari lalu
- `toDate` (optional): Format `YYYY-MM-DD`, default hari ini

**Example Request:**
```http
GET /api/dashboard/overview?fromDate=2025-11-01&toDate=2025-12-10
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "totalRevenue": {
    "title": "Total Revenue",
    "value": "Rp 2,500,000",
    "subtitle": "From 2025-11-01 to 2025-12-10",
    "trend": "up",
    "trendValue": "15.2%"
  },
  "totalOrders": {
    "title": "Total Orders",
    "value": "45",
    "subtitle": "Orders in selected period",
    "trend": "up",
    "trendValue": "8.5%"
  },
  "totalProducts": {
    "title": "Total Products",
    "value": "120",
    "subtitle": "5 products low stock",
    "trend": "stable",
    "trendValue": "0%"
  },
  "ordersByStatus": [
    {
      "status": "COMPLETED",
      "count": 20,
      "percentage": "44.4%"
    },
    {
      "status": "SHIPPING",
      "count": 15,
      "percentage": "33.3%"
    }
  ],
  "revenueChart": [
    {
      "date": "2025-12-01",
      "revenue": 150000.0,
      "orderCount": 3
    }
  ],
  "topProducts": [
    {
      "productName": "iPhone 15",
      "quantity": 25,
      "revenue": 500000.0,
      "category": "Electronics"
    }
  ],
  "topCategories": [
    {
      "categoryName": "Electronics",
      "quantity": 45,
      "revenue": 1200000.0,
      "percentage": "48.0%"
    }
  ],
  "recentOrders": [
    {
      "orderId": 123,
      "orderCode": "ORD-20251210-001",
      "customerName": "John Doe",
      "status": "PAID",
      "total": 250000.0,
      "date": "10/12/2025",
      "time": "14:30"
    }
  ]
}
```

---

## 💰 2. Revenue Data

### GET `/api/dashboard/revenue`
Mendapatkan data revenue untuk chart/grafik.

**Parameters:**
- `fromDate` (optional): Format `YYYY-MM-DD`
- `toDate` (optional): Format `YYYY-MM-DD`
- `period` (optional): `daily` atau `monthly`, default `daily`

**Example Request:**
```http
GET /api/dashboard/revenue?fromDate=2025-12-01&toDate=2025-12-10&period=daily
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "date": "2025-12-01",
    "revenue": 150000.0,
    "orderCount": 3
  },
  {
    "date": "2025-12-02",
    "revenue": 200000.0,
    "orderCount": 5
  },
  {
    "date": "2025-12-03",
    "revenue": 180000.0,
    "orderCount": 4
  }
]
```

---

## 📊 3. Orders by Status

### GET `/api/dashboard/orders-by-status`
Mendapatkan statistik order berdasarkan status.

**Parameters:**
- `fromDate` (optional): Format `YYYY-MM-DD`
- `toDate` (optional): Format `YYYY-MM-DD`

**Example Request:**
```http
GET /api/dashboard/orders-by-status?fromDate=2025-12-01&toDate=2025-12-10
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "status": "COMPLETED",
    "count": 20,
    "percentage": "44.4%"
  },
  {
    "status": "SHIPPING",
    "count": 15,
    "percentage": "33.3%"
  },
  {
    "status": "PAID",
    "count": 8,
    "percentage": "17.8%"
  },
  {
    "status": "PENDING_PAYMENT",
    "count": 2,
    "percentage": "4.4%"
  }
]
```

---

## 🏆 4. Top Products

### GET `/api/dashboard/top-products`
Mendapatkan produk terlaris berdasarkan quantity terjual.

**Parameters:**
- `fromDate` (optional): Format `YYYY-MM-DD`
- `toDate` (optional): Format `YYYY-MM-DD`
- `limit` (optional): Jumlah produk yang ditampilkan, default 10

**Example Request:**
```http
GET /api/dashboard/top-products?fromDate=2025-12-01&toDate=2025-12-10&limit=5
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "productName": "iPhone 15 Pro",
    "quantity": 25,
    "revenue": 500000.0,
    "category": "Electronics"
  },
  {
    "productName": "Samsung Galaxy S24",
    "quantity": 20,
    "revenue": 400000.0,
    "category": "Electronics"
  },
  {
    "productName": "MacBook Air M3",
    "quantity": 15,
    "revenue": 750000.0,
    "category": "Computers"
  }
]
```

---

## 🏷️ 5. Top Categories

### GET `/api/dashboard/top-categories`
Mendapatkan kategori terlaris berdasarkan revenue.

**Parameters:**
- `fromDate` (optional): Format `YYYY-MM-DD`
- `toDate` (optional): Format `YYYY-MM-DD`
- `limit` (optional): Jumlah kategori yang ditampilkan, default 10

**Example Request:**
```http
GET /api/dashboard/top-categories?fromDate=2025-12-01&toDate=2025-12-10&limit=5
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "categoryName": "Electronics",
    "quantity": 45,
    "revenue": 1200000.0,
    "percentage": "48.0%"
  },
  {
    "categoryName": "Computers",
    "quantity": 20,
    "revenue": 800000.0,
    "percentage": "32.0%"
  },
  {
    "categoryName": "Accessories",
    "quantity": 35,
    "revenue": 300000.0,
    "percentage": "12.0%"
  }
]
```

---

## 🕒 6. Recent Orders

### GET `/api/dashboard/recent-orders`
Mendapatkan order terbaru.

**Parameters:**
- `limit` (optional): Jumlah order yang ditampilkan, default 10

**Example Request:**
```http
GET /api/dashboard/recent-orders?limit=5
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "orderId": 123,
    "orderCode": "ORD-20251210-001",
    "customerName": "John Doe",
    "status": "PAID",
    "total": 250000.0,
    "date": "10/12/2025",
    "time": "14:30"
  },
  {
    "orderId": 122,
    "orderCode": "ORD-20251210-002",
    "customerName": "Jane Smith",
    "status": "SHIPPING",
    "total": 180000.0,
    "date": "10/12/2025",
    "time": "13:15"
  }
]
```

---

## 🎯 7. Complete Dashboard (All in One)

### GET `/api/dashboard/complete`
Mendapatkan semua data dashboard dalam satu request.

**Parameters:**
- `fromDate` (optional): Format `YYYY-MM-DD`
- `toDate` (optional): Format `YYYY-MM-DD`

**Example Request:**
```http
GET /api/dashboard/complete?fromDate=2025-12-01&toDate=2025-12-10
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "overview": {
    // Same as /overview endpoint response
  },
  "dateRange": {
    "from": "2025-12-01",
    "to": "2025-12-10"
  },
  "lastUpdated": "2025-12-10 15:30:45"
}
```

---

## 📱 Frontend Integration Examples

### React/JavaScript Example:
```javascript
// Get dashboard data
const getDashboardData = async (fromDate, toDate) => {
  try {
    const response = await fetch(`/api/dashboard/complete?fromDate=${fromDate}&toDate=${toDate}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

// Update revenue chart
const updateRevenueChart = async () => {
  const revenueData = await fetch('/api/dashboard/revenue?period=daily', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }).then(res => res.json());
  
  // Update your chart component with revenueData
};
```

### Chart.js Integration:
```javascript
// Revenue chart configuration
const revenueChartConfig = {
  type: 'line',
  data: {
    labels: revenueData.map(item => item.date),
    datasets: [{
      label: 'Revenue',
      data: revenueData.map(item => item.revenue),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'Rp ' + value.toLocaleString();
          }
        }
      }
    }
  }
};
```

---

## 🔧 Error Handling

### Common Error Responses:

**401 Unauthorized:**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Admin access required"
}
```

**500 Server Error:**
```json
{
  "error": "Error getting dashboard overview: [detailed error message]"
}
```

---

## 📊 Dashboard Components Mapping

### Stat Cards:
- **Total Revenue** → `/api/dashboard/overview` → `totalRevenue`
- **Total Orders** → `/api/dashboard/overview` → `totalOrders`
- **Total Products** → `/api/dashboard/overview` → `totalProducts`

### Charts:
- **Revenue Chart** → `/api/dashboard/revenue`
- **Orders by Status** → `/api/dashboard/orders-by-status`

### Tables:
- **Top Products** → `/api/dashboard/top-products`
- **Top Categories** → `/api/dashboard/top-categories`
- **Recent Orders** → `/api/dashboard/recent-orders`

---

## 🎯 Performance Tips

1. **Use date ranges** untuk membatasi data yang diproses
2. **Cache results** di frontend untuk mengurangi API calls
3. **Use complete endpoint** untuk initial load, individual endpoints untuk updates
4. **Implement pagination** untuk large datasets
5. **Add loading states** untuk better UX

---

**Total Dashboard Endpoints: 7**
- Overview: 1
- Revenue: 1
- Orders by Status: 1
- Top Products: 1
- Top Categories: 1
- Recent Orders: 1
- Complete Dashboard: 1