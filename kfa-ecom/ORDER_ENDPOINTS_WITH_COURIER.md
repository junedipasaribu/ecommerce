# Order Endpoints dengan Courier Name

## ✅ Update Terbaru
Semua endpoint order sekarang mengembalikan data `courierName` dan `shippingCost` dalam response.

## Base URL
```
http://localhost:8081
```

## User Order Endpoints

### 1. Get My Orders
```http
GET /api/orders/my
Authorization: Bearer <user_token>
```

**Response:**
```json
[
  {
    "orderId": 1,
    "orderCode": "ORD-12345",
    "totalAmount": 50000.0,
    "status": "PENDING_PAYMENT",
    "createdAt": "2025-12-10T10:00:00",
    "expiresAt": "2025-12-10T11:00:00",
    "paymentMethod": "KFA_PAY",
    "address": "John Doe | 08123456789 | Jl. Sudirman No. 1, Jakarta",
    "courierName": "JNE",           // ✅ Data courier
    "shippingCost": 20000.0,        // ✅ Biaya kirim
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

### 2. Get My Order Detail
```http
GET /api/orders/my/{orderId}
Authorization: Bearer <user_token>
```

**Response:** Same format as above (single object)

### 3. Checkout (Create Order)
```http
POST /api/orders/checkout
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "addressId": 1,
  "courierName": "JNE",
  "paymentMethod": "KFA_PAY"
}
```

**Response:**
```json
{
  "orderId": 123,
  "orderCode": "ORD-uuid",
  "totalAmount": 50000.0,
  "status": "PENDING_PAYMENT",
  "paymentMethod": "KFA_PAY",
  "message": "Checkout pengiriman dengan kurir JNE. Selesaikan pembayaran dalam 60 menit via KFA_PAY."
}
```

## Admin Order Endpoints

### 1. Get All Orders (Admin)
```http
GET /api/orders/admin/all
Authorization: Bearer <admin_token>
```

**Response:** Array dengan format yang sama seperti user orders, tapi menampilkan semua order dari semua user.

### 2. Get Order Detail (Admin)
```http
GET /api/orders/admin/{orderId}
Authorization: Bearer <admin_token>
```

### 3. Update Order Status (Admin)
```http
PATCH /api/orders/admin/{orderId}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "PAID"
}
```

### 4. Cancel Order (Admin)
```http
PATCH /api/orders/admin/{orderId}/cancel
Authorization: Bearer <admin_token>
```

## Courier Names yang Tersedia

Berdasarkan implementasi, courier names yang bisa digunakan:
- `JNE`
- `TIKI` 
- `POS`
- `J&T`
- `SiCepat`
- `Anteraja`
- `Ninja Express`
- dll (sesuai kebutuhan bisnis)

## Status Order yang Tersedia

- `PENDING_PAYMENT` - Menunggu pembayaran
- `PAID` - Sudah dibayar
- `PROCESSING` - Sedang diproses  
- `SHIPPING` - Sedang dikirim
- `COMPLETED` - Selesai
- `CANCELLED_BY_USER` - Dibatalkan user
- `CANCELLED_BY_ADMIN` - Dibatalkan admin
- `EXPIRED` - Kadaluarsa

## Example Testing di Postman

### 1. Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 2. Checkout dengan Courier
```http
POST /api/orders/checkout
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "addressId": 1,
  "courierName": "JNE",
  "paymentMethod": "KFA_PAY"
}
```

### 3. Lihat Order dengan Courier Info
```http
GET /api/orders/my
Authorization: Bearer <user_token>
```

Response akan menampilkan:
- `courierName`: "JNE"
- `shippingCost`: 20000.0
- Plus semua data order lainnya

### 4. Admin Lihat Semua Order
```http
GET /api/orders/admin/all
Authorization: Bearer <admin_token>
```

## ⚠️ Catatan Penting

1. **Courier Name Required**: Saat checkout, `courierName` wajib diisi
2. **Shipping Cost**: Dihitung otomatis berdasarkan courier (saat ini flat rate 20000)
3. **Response Consistency**: Semua endpoint order mengembalikan format yang sama
4. **Backward Compatible**: Endpoint lama tetap berfungsi dengan data tambahan
5. **Admin Access**: Admin bisa lihat courier info dari semua order

## 🎯 Manfaat Data Courier

- **Tracking**: User dan admin tahu pakai courier apa
- **Cost Transparency**: Biaya kirim terlihat jelas
- **Order Management**: Admin bisa filter/sort berdasarkan courier
- **Customer Service**: Info lengkap untuk handle komplain
- **Analytics**: Data untuk analisis performa courier

Sekarang semua endpoint order sudah mengembalikan informasi courier yang lengkap! 🚀