# 📋 Daftar Status Order Backend

## ✅ STATUS YANG VALID

Berdasarkan kode backend, berikut adalah **8 status order** yang dapat diterima:

### 1. **PENDING_PAYMENT**
- **Deskripsi**: Order baru yang menunggu pembayaran
- **Status Default**: ✅ Status awal saat order dibuat
- **Dapat diubah ke**: PAID, CANCELLED_BY_USER, CANCELLED_BY_ADMIN, EXPIRED
- **Aksi yang bisa dilakukan**:
  - User bisa cancel order
  - Admin bisa cancel order
  - Sistem auto-cancel jika expired
  - Payment processing

### 2. **PAID**
- **Deskripsi**: Order sudah dibayar
- **Diubah oleh**: PaymentService saat payment berhasil
- **Dapat diubah ke**: PROCESSING, SHIPPING, CANCELLED_BY_ADMIN
- **Aksi yang bisa dilakukan**:
  - Admin bisa add tracking (langsung ke SHIPPING)
  - Admin bisa update ke PROCESSING
  - Admin bisa cancel

### 3. **PROCESSING**
- **Deskripsi**: Order sedang diproses/dikemas
- **Diubah oleh**: Admin manual
- **Dapat diubah ke**: SHIPPING, CANCELLED_BY_ADMIN
- **Aksi yang bisa dilakukan**:
  - Admin bisa add tracking (langsung ke SHIPPING)
  - Admin bisa cancel

### 4. **SHIPPING**
- **Deskripsi**: Order sedang dikirim
- **Diubah oleh**: ShippingService saat add tracking
- **Dapat diubah ke**: COMPLETED, CANCELLED_BY_ADMIN
- **Aksi yang bisa dilakukan**:
  - User bisa complete order (jika shipping status = DELIVERED)
  - Admin bisa cancel (dalam kasus khusus)

### 5. **COMPLETED**
- **Deskripsi**: Order selesai/diterima customer
- **Diubah oleh**: User saat confirm delivery
- **Dapat diubah ke**: ❌ Final status
- **Aksi yang bisa dilakukan**:
  - ❌ Tidak bisa dicancel
  - ❌ Tidak bisa diubah lagi

### 6. **CANCELLED_BY_USER**
- **Deskripsi**: Order dibatalkan oleh customer
- **Diubah oleh**: User (hanya untuk PENDING_PAYMENT)
- **Dapat diubah ke**: Status aktif (dengan restore stock)
- **Aksi yang bisa dilakukan**:
  - Admin bisa reaktivasi order
  - Stock otomatis dikembalikan

### 7. **CANCELLED_BY_ADMIN**
- **Deskripsi**: Order dibatalkan oleh admin
- **Diubah oleh**: Admin
- **Dapat diubah ke**: Status aktif (dengan restore stock)
- **Aksi yang bisa dilakukan**:
  - Admin bisa reaktivasi order
  - Stock otomatis dikembalikan

### 8. **EXPIRED**
- **Deskripsi**: Order expired karena tidak dibayar
- **Diubah oleh**: OrderScheduler (auto-cancel)
- **Dapat diubah ke**: Status aktif (dengan restore stock)
- **Aksi yang bisa dilakukan**:
  - Admin bisa reaktivasi order
  - Stock otomatis dikembalikan

## 🔄 FLOW STATUS ORDER

```
PENDING_PAYMENT → PAID → PROCESSING → SHIPPING → COMPLETED
       ↓             ↓         ↓          ↓
   CANCELLED_*   CANCELLED_* CANCELLED_* CANCELLED_*
       ↓             ↓         ↓          ↓
    EXPIRED      (restore)  (restore)  (restore)
```

## 🛠️ PENGGUNAAN DI API

### Update Status Order (Admin)
```http
PATCH /api/orders/admin/{orderId}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "PROCESSING"
}
```

**Status yang bisa digunakan:**
```json
{
  "status": "PENDING_PAYMENT"
}
```
```json
{
  "status": "PAID"
}
```
```json
{
  "status": "PROCESSING"
}
```
```json
{
  "status": "SHIPPING"
}
```
```json
{
  "status": "COMPLETED"
}
```
```json
{
  "status": "CANCELLED_BY_USER"
}
```
```json
{
  "status": "CANCELLED_BY_ADMIN"
}
```
```json
{
  "status": "EXPIRED"
}
```

## ⚠️ BUSINESS RULES

### Stock Management:
- **Saat order dibuat**: Stock dikurangi
- **Saat cancel/expired**: Stock dikembalikan
- **Saat reaktivasi**: Stock dikurangi lagi

### Status Validation:
- ✅ Semua 8 status di atas valid
- ❌ Status lain akan error: "Invalid status: [status]"
- ✅ Case-sensitive (harus UPPERCASE)

### Special Cases:
- **COMPLETED order**: Tidak bisa dicancel
- **Already cancelled**: Tidak bisa dicancel lagi
- **PENDING_PAYMENT**: Hanya status ini yang bisa dicancel user
- **Add Tracking**: Otomatis ubah status ke SHIPPING

## 🎯 CONTOH PENGGUNAAN

### Scenario 1: Order Normal
1. `PENDING_PAYMENT` (checkout)
2. `PAID` (payment success)
3. `PROCESSING` (admin update)
4. `SHIPPING` (admin add tracking)
5. `COMPLETED` (user confirm)

### Scenario 2: Order Cancelled
1. `PENDING_PAYMENT` (checkout)
2. `CANCELLED_BY_USER` (user cancel)

### Scenario 3: Admin Cancel
1. `PENDING_PAYMENT` → `PAID` → `PROCESSING`
2. `CANCELLED_BY_ADMIN` (admin cancel)

### Scenario 4: Auto Expired
1. `PENDING_PAYMENT` (checkout)
2. `EXPIRED` (scheduler auto-cancel)

---

**CATATAN PENTING:**
- Status harus **UPPERCASE** dan **exact match**
- Backend akan validate status sebelum update
- Stock management otomatis berdasarkan perubahan status