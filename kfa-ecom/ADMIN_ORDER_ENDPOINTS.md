# Admin Order Management Endpoints

Berikut adalah endpoint yang telah ditambahkan untuk admin mengelola order:

## ✅ Update Terbaru
- Menambahkan `courierName` dan `shippingCost` ke response semua endpoint order
- Menambahkan `userId`, `customerName`, dan `customerEmail` ke response order
- Response sekarang lebih lengkap dengan informasi customer dan pengiriman

## Base URL
```
http://localhost:8081
```

## Authentication
Semua endpoint admin memerlukan:
- Header: `Authorization: Bearer <JWT_TOKEN>`
- Role: `ADMIN`

## Endpoints

### 1. Get All Orders (Admin)
```http
GET /api/orders/admin/all
```

**Response:**
```json
[
  {
    "orderId": 1,
    "orderCode": "ORD-12345",
    "userId": 5,
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "totalAmount": 50000.0,
    "status": "PENDING_PAYMENT",
    "createdAt": "2025-12-10T10:00:00",
    "expiresAt": "2025-12-10T11:00:00",
    "paymentMethod": "KFA_PAY",
    "address": "John Doe | 08123456789 | Jl. Sudirman No. 1, Jakarta, DKI Jakarta - 12345",
    "courierName": "JNE",
    "shippingCost": 20000.0,
    "items": [
      {
        "productId": 1,
        "productName": "Paracetamol 500mg",
        "price": 5000.0,
        "quantity": 2
      }
    ]
  }
]
```

### 2. Get Order Detail (Admin)
```http
GET /api/orders/admin/{orderId}
```

**Response:** Same as above but single object

### 3. Update Order Status (Admin)
```http
PATCH /api/orders/admin/{orderId}/status
Content-Type: application/json

{
  "status": "PAID"
}
```

**Valid Status Values:**
- `PENDING_PAYMENT` - Menunggu pembayaran
- `PAID` - Sudah dibayar
- `PROCESSING` - Sedang diproses
- `SHIPPING` - Sedang dikirim
- `COMPLETED` - Selesai
- `CANCELLED_BY_USER` - Dibatalkan user
- `CANCELLED_BY_ADMIN` - Dibatalkan admin
- `EXPIRED` - Kadaluarsa

**Response:**
```json
"Order status updated successfully"
```

### 4. Cancel Order (Admin)
```http
PATCH /api/orders/admin/{orderId}/cancel
```

**Response:**
```json
"Order cancelled by admin"
```

## Business Logic

### Status Update Rules:
1. **Stock Management**: 
   - Jika order dibatalkan/expired → stok produk dikembalikan
   - Jika order yang dibatalkan diaktifkan kembali → stok dikurangi lagi

2. **Cancel Restrictions**:
   - Order dengan status `COMPLETED` tidak bisa dibatalkan
   - Order yang sudah `CANCELLED` tidak bisa dibatalkan lagi

3. **Status Validation**:
   - Hanya status yang valid yang bisa digunakan
   - Sistem akan menolak status yang tidak dikenal

## Example Usage in Postman

### 1. Login sebagai Admin
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### 2. Get All Orders
```http
GET /api/orders/admin/all
Authorization: Bearer <token_from_login>
```

### 3. Update Order Status
```http
PATCH /api/orders/admin/123/status
Authorization: Bearer <token_from_login>
Content-Type: application/json

{
  "status": "PAID"
}
```

### 4. Cancel Order
```http
PATCH /api/orders/admin/123/cancel
Authorization: Bearer <token_from_login>
```

## Error Responses

### 401 Unauthorized
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "status": 403,
  "error": "Forbidden", 
  "message": "Insufficient permissions"
}
```

### 400 Bad Request
```json
"Error updating order status: Invalid status: INVALID_STATUS"
```

### 404 Not Found
```json
"Error updating order status: Order not found"
```