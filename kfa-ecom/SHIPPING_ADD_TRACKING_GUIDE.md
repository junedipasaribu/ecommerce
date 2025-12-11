# Panduan Lengkap: Add Tracking Number

## ❌ Error yang Mungkin Terjadi

### 1. Error 401 Unauthorized
**Penyebab**: Tidak ada authentication token atau token tidak valid
**Solusi**: Login sebagai admin terlebih dahulu

### 2. Error 500 Internal Server Error
**Penyebab Umum**:
- Order tidak ditemukan (orderId salah)
- Order belum dalam status yang tepat
- Data JSON tidak sesuai format

## ✅ Step by Step Testing

### Step 1: Login sebagai Admin
```http
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

### Step 2: Cek Order yang Ada
```http
GET http://localhost:8081/api/orders/admin/all
Authorization: Bearer <admin_token>
```

**Cari order dengan status:**
- `PAID` ✅
- `PROCESSING` ✅  
- `PAYMENT_SUCCESS` ✅

**Contoh Response:**
```json
[
  {
    "orderId": 1,
    "orderCode": "ORD-12345",
    "status": "PAID",        // ✅ Status yang tepat
    "courierName": "JNE",
    "totalAmount": 50000.0
  }
]
```

### Step 3: Add Tracking Number
```http
POST http://localhost:8081/api/admin/shipping/add
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "orderId": 1,                    // ✅ Gunakan orderId yang PAID
  "courier": "JNE",               // ✅ Nama kurir
  "trackingNumber": "JNE123456789" // ✅ Nomor resi
}
```

## 📋 Format JSON yang Benar

### Template:
```json
{
  "orderId": <number>,
  "courier": "<string>",
  "trackingNumber": "<string>"
}
```

### Contoh Valid:
```json
{
  "orderId": 1,
  "courier": "JNE",
  "trackingNumber": "JNE123456789"
}
```

```json
{
  "orderId": 2,
  "courier": "TIKI",
  "trackingNumber": "TIKI987654321"
}
```

```json
{
  "orderId": 3,
  "courier": "J&T",
  "trackingNumber": "JT001234567890"
}
```

## ⚠️ Validasi yang Dilakukan Backend

### 1. Order Validation:
- Order harus ada (orderId valid)
- Order status harus: `PAID`, `PROCESSING`, atau `PAYMENT_SUCCESS`

### 2. Field Validation:
- `orderId`: Harus number, tidak boleh null
- `courier`: Harus string, tidak boleh kosong
- `trackingNumber`: Harus string, tidak boleh kosong

## 🔧 Troubleshooting

### Error: "Order not found"
**Solusi**: 
- Cek orderId yang digunakan
- Pastikan order benar-benar ada di database

### Error: "Order is not in paid/processing status"
**Solusi**:
- Cek status order dengan GET /api/orders/admin/all
- Update status order ke PAID terlebih dahulu jika perlu

### Error: "Authentication required"
**Solusi**:
- Login sebagai admin
- Pastikan token di header Authorization
- Format: `Authorization: Bearer <token>`

### Error: "Insufficient permissions"
**Solusi**:
- Pastikan login sebagai user dengan role ADMIN
- Bukan user biasa

## 🎯 Testing Scenario Lengkap

### Scenario 1: Order Baru
1. Buat order baru (checkout)
2. Update status order ke PAID (admin)
3. Add tracking number
4. Verify order status berubah ke SHIPPING

### Scenario 2: Update Tracking Existing
1. Cari order yang sudah ada shipping
2. Add tracking dengan orderId yang sama
3. Tracking number akan di-update (bukan create baru)

## 📱 Postman Collection

### Environment Variables:
- `baseUrl`: http://localhost:8081
- `adminToken`: <token_from_login>

### Request Collection:
1. **Admin Login**
2. **Get All Orders**
3. **Add Tracking**
4. **Get All Shipping** (verify)

## ✅ Expected Success Response

```json
"Shipping created / updated & order status set to SHIPPING"
```

### What Happens Behind the Scene:
1. ✅ Order status berubah ke `SHIPPING`
2. ✅ Shipping record dibuat/diupdate
3. ✅ `shippedDate` di-set ke waktu sekarang
4. ✅ `shippingStatus` di-set ke `ON_DELIVERY`

Ikuti step by step ini untuk testing yang berhasil! 🚀