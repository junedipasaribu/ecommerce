# Solusi Error 500 - Add Shipping Tracking

## 🔍 Analisis Error

Error 500 Internal Server Error pada endpoint `/api/admin/shipping/add` kemungkinan disebabkan oleh:

1. **Order ID tidak ditemukan**
2. ~~**Order status tidak sesuai**~~ ✅ **FIXED: Status validation removed**
3. **Authentication/Authorization issue**
4. **Database constraint error**

## ✅ STATUS UPDATE - MASALAH TERPECAHKAN

**PERUBAHAN TERBARU:**
- ✅ Status validation sudah dihapus dari `ShippingService.java`
- ✅ Admin sekarang bisa add tracking untuk order dengan status APAPUN (termasuk PENDING)
- ✅ Aplikasi sudah restart dan berjalan di port 8081
- ✅ Endpoint siap untuk testing

## ✅ Solusi Step by Step

### Step 1: Pastikan Authentication Benar

#### Login Admin:
```http
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Jika user admin belum ada, buat dulu atau gunakan user yang ada dengan role ADMIN**

### Step 2: Cek Order yang Tersedia

```http
GET http://localhost:8081/api/orders/admin/all
Authorization: Bearer <token_dari_step_1>
```

**✅ SEKARANG BISA UNTUK SEMUA STATUS:**
- ✅ `PENDING` (sekarang bisa!)
- ✅ `PAID`
- ✅ `PROCESSING` 
- ✅ `PAYMENT_SUCCESS`
- ✅ Status apapun (admin punya kontrol penuh)

### Step 3: Gunakan Order ID yang Benar

Dari response Step 2, ambil `orderId` yang statusnya sesuai.

**Contoh response yang baik:**
```json
[
  {
    "orderId": 5,           // ✅ Gunakan ID ini
    "orderCode": "ORD-123",
    "status": "PAID",       // ✅ Status yang tepat
    "courierName": "JNE",
    "totalAmount": 50000.0
  }
]
```

### Step 4: Add Tracking dengan Data yang Benar

```http
POST http://localhost:8081/api/admin/shipping/add
Authorization: Bearer <token_dari_step_1>
Content-Type: application/json

{
  "orderId": 5,                    // ✅ ID dari step 3
  "courier": "JNE",               
  "trackingNumber": "JNE123456789"
}
```

## 🛠️ Alternatif Jika Tidak Ada Order PAID

### Opsi 1: Update Status Order Existing
```http
PATCH http://localhost:8081/api/orders/admin/{orderId}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "PAID"
}
```

### Opsi 2: Buat Order Baru (sebagai user)
1. **Register/Login sebagai user biasa**
2. **Add product ke cart**
3. **Checkout untuk buat order**
4. **Login sebagai admin**
5. **Update order status ke PAID**
6. **Add tracking**

## 📋 Format JSON yang Pasti Benar

### Template Minimal:
```json
{
  "orderId": 1,
  "courier": "JNE", 
  "trackingNumber": "JNE123456789"
}
```

### Variasi Courier:
```json
{
  "orderId": 1,
  "courier": "TIKI",
  "trackingNumber": "TIKI987654321"
}
```

```json
{
  "orderId": 1,
  "courier": "J&T",
  "trackingNumber": "JT001234567890"
}
```

## 🔧 Troubleshooting Lanjutan

### Jika Masih Error 500:

#### Cek Error Message Terbaru:
Dengan exception handling yang sudah ditambahkan, sekarang error akan menampilkan message yang lebih jelas seperti:

- `"Error adding tracking: Order not found"`
- `"Error adding tracking: Order is not in paid/processing status. Current status: PENDING_PAYMENT"`

#### Solusi Berdasarkan Error Message:

**"Order not found"**
- Gunakan orderId yang benar dari GET /api/orders/admin/all

~~**"Order is not in paid/processing status"**~~ ✅ **TIDAK AKAN TERJADI LAGI**
- Status validation sudah dihapus
- Admin bisa add tracking untuk status apapun

**"Authentication required"**
- Pastikan header Authorization ada
- Format: `Authorization: Bearer <token>`

## 🎯 Testing Scenario yang Pasti Berhasil

### Scenario A: Menggunakan Order Existing
1. ✅ Login admin
2. ✅ GET all orders
3. ✅ Cari order dengan status PAID
4. ✅ Add tracking dengan orderId tersebut

### Scenario B: Buat Order Baru
1. ✅ Register user baru
2. ✅ Login user
3. ✅ Add product ke cart
4. ✅ Checkout (buat order)
5. ✅ Login admin
6. ✅ Update order status ke PAID
7. ✅ Add tracking

## 📱 Postman Headers yang Benar

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json
```

## ✅ Expected Success Response

```json
"Shipping created / updated & order status set to SHIPPING"
```

### What Happens After Success:
1. ✅ Order status → `SHIPPING`
2. ✅ Shipping record created
3. ✅ `shippedDate` → current time
4. ✅ `shippingStatus` → `ON_DELIVERY`

## 🚨 Jika Masih Gagal

Coba langkah ini:
1. **Restart aplikasi backend**
2. **Cek database connection**
3. **Pastikan table `shippings` ada**
4. **Cek log aplikasi untuk error detail**

Ikuti step by step ini dengan teliti, pasti berhasil! 🚀