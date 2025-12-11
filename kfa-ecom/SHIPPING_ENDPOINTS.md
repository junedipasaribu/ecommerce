# Shipping Management Endpoints

## ✅ Update Terbaru
Menambahkan endpoint GET untuk admin melihat data shipping yang sebelumnya hanya bisa POST dan PATCH.

## Base URL
```
http://localhost:8081
```

## Admin Shipping Endpoints

### 1. Get All Shipping Data (NEW)
```http
GET /api/admin/shipping/all
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "orderId": 1,
    "orderCode": "ORD-12345",
    "trackingNumber": "JNE123456789",
    "courierName": "JNE",
    "shippingStatus": "ON_DELIVERY",
    "shippedDate": "2025-12-10T10:00:00",
    "deliveredDate": null,
    "customerName": "John Doe",
    "customerAddress": "John Doe | 08123456789 | Jl. Sudirman No. 1, Jakarta, DKI Jakarta - 12345"
  },
  {
    "orderId": 2,
    "orderCode": "ORD-67890",
    "trackingNumber": "TIKI987654321",
    "courierName": "TIKI",
    "shippingStatus": "DELIVERED",
    "shippedDate": "2025-12-09T14:30:00",
    "deliveredDate": "2025-12-10T09:15:00",
    "customerName": "Jane Smith",
    "customerAddress": "Jane Smith | 08987654321 | Jl. Thamrin No. 5, Jakarta, DKI Jakarta - 54321"
  }
]
```

### 2. Get Shipping by Order ID (NEW)
```http
GET /api/admin/shipping/{orderId}
Authorization: Bearer <admin_token>
```

**Example:**
```http
GET /api/admin/shipping/123
```

**Response:** Same format as above (single object)

### 3. Get Shipping by Tracking Number (NEW)
```http
GET /api/admin/shipping/track/{trackingNumber}
Authorization: Bearer <admin_token>
```

**Example:**
```http
GET /api/admin/shipping/track/JNE123456789
```

**Response:** Same format as above (single object)

### 4. Add Shipping Tracking (Existing)
```http
POST /api/admin/shipping/add
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "orderId": 123,
  "trackingNumber": "JNE123456789",
  "courier": "JNE"
}
```

**Response:**
```json
"Shipping created / updated & order status set to SHIPPING"
```

### 5. Update Shipping Status (Existing)
```http
PATCH /api/admin/shipping/status?orderId=123&status=DELIVERED
Authorization: Bearer <admin_token>
```

**Response:**
```json
"Shipping status updated"
```

## User Shipping Endpoints

### 1. Get My Shipping Tracking
```http
GET /api/shipping/{orderId}
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "orderId": 123,
  "orderCode": "ORD-12345",
  "trackingNumber": "JNE123456789",
  "courierName": "JNE",
  "shippingStatus": "ON_DELIVERY",
  "shippedDate": "2025-12-10T10:00:00",
  "deliveredDate": null
}
```

## Shipping Status Values

- `ON_DELIVERY` - Sedang dalam perjalanan
- `DELIVERED` - Sudah diterima
- `RETURNED` - Dikembalikan
- `FAILED` - Gagal kirim
- `CANCELLED` - Dibatalkan

## Response Fields Explanation

### Admin Response Fields:
- `orderId` - ID order
- `orderCode` - Kode order (ORD-xxx)
- `trackingNumber` - Nomor resi
- `courierName` - Nama kurir (JNE, TIKI, etc.)
- `shippingStatus` - Status pengiriman
- `shippedDate` - Tanggal dikirim
- `deliveredDate` - Tanggal diterima (null jika belum)
- `customerName` - Nama customer
- `customerAddress` - Alamat lengkap customer

### User Response Fields:
- Same as admin but without `customerName` and `customerAddress`

## Example Usage in Postman

### 1. Login as Admin
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### 2. Get All Shipping Data
```http
GET /api/admin/shipping/all
Authorization: Bearer <admin_token>
```

### 3. Search by Tracking Number
```http
GET /api/admin/shipping/track/JNE123456789
Authorization: Bearer <admin_token>
```

### 4. Add New Shipping
```http
POST /api/admin/shipping/add
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "orderId": 123,
  "trackingNumber": "JNE123456789",
  "courier": "JNE"
}
```

### 5. Update Status to Delivered
```http
PATCH /api/admin/shipping/status?orderId=123&status=DELIVERED
Authorization: Bearer <admin_token>
```

## Error Responses

### 404 Not Found
```json
"Shipping not found: Shipping not found for order ID: 123"
```

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

## Business Logic

### Add Tracking:
- Order harus dalam status `PAID` atau `PAYMENT_SUCCESS`
- Jika shipping sudah ada, akan di-update
- Order status otomatis berubah ke `SHIPPING`
- `shippedDate` di-set ke waktu sekarang

### Update Status:
- Jika status = `DELIVERED`, `deliveredDate` di-set otomatis
- Order tidak otomatis `COMPLETED` (harus dikonfirmasi user)

### Get Data:
- Admin bisa lihat semua data shipping
- User hanya bisa lihat shipping order miliknya
- Search by tracking number untuk admin

## 🎯 Manfaat untuk Admin

- **Dashboard Shipping**: Lihat semua pengiriman dalam satu view
- **Search & Filter**: Cari berdasarkan order ID atau tracking number
- **Customer Info**: Lihat detail customer dan alamat
- **Status Management**: Update status pengiriman dengan mudah
- **Tracking Management**: Input dan kelola nomor resi

Sekarang admin memiliki kontrol penuh untuk mengelola data shipping! 🚀