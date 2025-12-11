# 🚀 Complete API Collection - KFA E-Commerce Backend

**Base URL**: `http://localhost:8081`

---

## 🔐 1. AUTHENTICATION ENDPOINTS

### 1.1 Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

### 1.2 Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123"
}
```

### 1.3 Test Auth
```http
GET /api/auth/test
```

---

## 📦 2. PRODUCT ENDPOINTS

### 2.1 Get All Products
```http
GET /api/products
```

### 2.2 Get Product by ID
```http
GET /api/products/{id}
```

### 2.3 Create Product (Admin)
```http
POST /api/products
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product Description",
  "price": 50000.0,
  "stock": 100,
  "category": "Electronics",
  "imageUrl": "https://example.com/image.jpg"
}
```

### 2.4 Update Product (Admin)
```http
PUT /api/products/{id}
Content-Type: application/json

{
  "name": "Updated Product Name",
  "description": "Updated Description",
  "price": 60000.0,
  "stock": 80,
  "category": "Electronics",
  "imageUrl": "https://example.com/new-image.jpg"
}
```

### 2.5 Delete Product (Admin)
```http
DELETE /api/products/{id}
```

---

## 🏷️ 3. CATEGORY ENDPOINTS

### 3.1 Get All Categories
```http
GET /api/categories
```

### 3.2 Test Categories
```http
GET /api/categories/test
```

### 3.3 Fix Product Sequence (Admin)
```http
POST /api/categories/fix-sequence
```

---

## 🛒 4. CART ENDPOINTS
**🔒 Requires Authentication**

### 4.1 Get My Cart
```http
GET /api/cart
Authorization: Bearer <token>
```

### 4.2 Add Item to Cart
```http
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

### 4.3 Update Cart Item
```http
PUT /api/cart/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": 1,
  "quantity": 5
}
```

### 4.4 Remove Item from Cart
```http
DELETE /api/cart/remove/{productId}
Authorization: Bearer <token>
```

### 4.5 Clear Cart
```http
DELETE /api/cart/clear
Authorization: Bearer <token>
```

### 4.6 Get Cart Item Count
```http
GET /api/cart/count
Authorization: Bearer <token>
```

---

## 📍 5. ADDRESS ENDPOINTS
**🔒 Requires Authentication**

### 5.1 Add Address
```http
POST /api/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientName": "John Doe",
  "phone": "081234567890",
  "street": "Jl. Merdeka No. 123",
  "city": "Jakarta",
  "province": "DKI Jakarta",
  "postalCode": "12345",
  "isPrimary": true
}
```

### 5.2 Get My Addresses
```http
GET /api/addresses
Authorization: Bearer <token>
```

### 5.3 Update Address
```http
PUT /api/addresses/{addressId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientName": "John Doe Updated",
  "phone": "081234567890",
  "street": "Jl. Merdeka No. 456",
  "city": "Jakarta",
  "province": "DKI Jakarta",
  "postalCode": "12345",
  "isPrimary": false
}
```

### 5.4 Set Primary Address
```http
PATCH /api/addresses/{addressId}/primary
Authorization: Bearer <token>
```

### 5.5 Delete Address
```http
DELETE /api/addresses/{addressId}
Authorization: Bearer <token>
```

---

## 🛍️ 6. ORDER ENDPOINTS

### 6.1 USER ORDER ENDPOINTS
**🔒 Requires Authentication**

#### 6.1.1 Checkout
```http
POST /api/orders/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "addressId": 1,
  "paymentMethod": "BANK_TRANSFER",
  "courier": "JNE",
  "shippingCost": 15000.0
}
```

#### 6.1.2 Get My Orders
```http
GET /api/orders/my
Authorization: Bearer <token>
```

#### 6.1.3 Get My Order Detail
```http
GET /api/orders/my/{orderId}
Authorization: Bearer <token>
```

#### 6.1.4 Cancel Order (User)
```http
PATCH /api/orders/cancel/{orderId}
Authorization: Bearer <token>
```

#### 6.1.5 Confirm Order Completed
```http
POST /api/orders/completed/{orderId}
Authorization: Bearer <token>
```

### 6.2 ADMIN ORDER ENDPOINTS
**🔒 Requires Admin Authentication**

#### 6.2.1 Get All Orders
```http
GET /api/orders/admin/all
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "orderId": 1,
    "orderCode": "ORD-20251210-001",
    "userId": 5,
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "totalAmount": 250000.0,
    "status": "PAID",
    "createdAt": "2025-12-10T14:30:00",
    "expiresAt": "2025-12-11T14:30:00",
    "paymentMethod": "BANK_TRANSFER",
    "address": "Jl. Merdeka No. 123, Jakarta",
    "courierName": "JNE",
    "shippingCost": 15000.0,
    "items": [
      {
        "productId": 1,
        "productName": "iPhone 15",
        "price": 15000000.0,
        "quantity": 1
      }
    ]
  }
]
```

#### 6.2.2 Get Order Detail
```http
GET /api/orders/admin/{orderId}
Authorization: Bearer <admin_token>
```

**Response:** Same format as Get All Orders (single order object)

#### 6.2.3 Update Order Status
```http
PATCH /api/orders/admin/{orderId}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "PROCESSING"
}
```

**Valid Status Values:**
- `PENDING_PAYMENT`
- `PAID`
- `PROCESSING`
- `SHIPPING`
- `COMPLETED`
- `CANCELLED_BY_USER`
- `CANCELLED_BY_ADMIN`
- `EXPIRED`

#### 6.2.4 Cancel Order (Admin)
```http
PATCH /api/orders/admin/{orderId}/cancel
Authorization: Bearer <admin_token>
```

---

## 💳 7. PAYMENT ENDPOINTS
**🔒 Requires Authentication**

### 7.1 Pay Order
```http
POST /api/payments/pay/{orderId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "BANK_TRANSFER",
  "paymentReference": "TXN123456789"
}
```

---

## 🚚 8. SHIPPING ENDPOINTS

### 8.1 USER SHIPPING ENDPOINTS
**🔒 Requires Authentication**

#### 8.1.1 Get Shipping Tracking
```http
GET /api/shipping/{orderId}
Authorization: Bearer <token>
```

### 8.2 ADMIN SHIPPING ENDPOINTS
**🔒 Requires Admin Authentication**

#### 8.2.1 Add Tracking Number
```http
POST /api/admin/shipping/add
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "orderId": 1,
  "courier": "JNE",
  "trackingNumber": "JNE123456789"
}
```

#### 8.2.2 Update Shipping Status
```http
PATCH /api/admin/shipping/status?orderId=1&status=DELIVERED
Authorization: Bearer <admin_token>
```

**Valid Shipping Status:**
- `ON_DELIVERY`
- `DELIVERED`
- `RETURNED`
- `FAILED_DELIVERY`

#### 8.2.3 Get All Shipping Data
```http
GET /api/admin/shipping/all
Authorization: Bearer <admin_token>
```

#### 8.2.4 Get Shipping by Order ID
```http
GET /api/admin/shipping/{orderId}
Authorization: Bearer <admin_token>
```

#### 8.2.5 Get Shipping by Tracking Number
```http
GET /api/admin/shipping/track/{trackingNumber}
Authorization: Bearer <admin_token>
```

---

## 🔧 9. POSTMAN ENVIRONMENT SETUP

### Environment Variables:
```json
{
  "baseUrl": "http://localhost:8081",
  "userToken": "",
  "adminToken": ""
}
```

### Pre-request Script for Authentication:
```javascript
// For endpoints that require authentication
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('userToken')
});
```

### Pre-request Script for Admin Authentication:
```javascript
// For admin endpoints
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('adminToken')
});
```

---

## 📋 10. TESTING SCENARIOS

### Scenario 1: Complete User Flow
1. **Register** → `POST /api/auth/register`
2. **Login** → `POST /api/auth/login`
3. **Browse Products** → `GET /api/products`
4. **Add to Cart** → `POST /api/cart/add`
5. **Add Address** → `POST /api/addresses`
6. **Checkout** → `POST /api/orders/checkout`
7. **Pay Order** → `POST /api/payments/pay/{orderId}`
8. **Track Shipping** → `GET /api/shipping/{orderId}`
9. **Confirm Delivery** → `POST /api/orders/completed/{orderId}`

### Scenario 2: Admin Management Flow
1. **Admin Login** → `POST /api/auth/login`
2. **View All Orders** → `GET /api/orders/admin/all`
3. **Update Order Status** → `PATCH /api/orders/admin/{orderId}/status`
4. **Add Tracking** → `POST /api/admin/shipping/add`
5. **Update Shipping Status** → `PATCH /api/admin/shipping/status`
6. **View Shipping Data** → `GET /api/admin/shipping/all`

---

## ⚠️ IMPORTANT NOTES

### Authentication:
- Most endpoints require `Authorization: Bearer <token>` header
- Admin endpoints require admin role token
- Token obtained from login response

### Error Handling:
- **401**: Authentication required or invalid token
- **403**: Insufficient permissions (not admin)
- **404**: Resource not found
- **500**: Server error with detailed message

### Data Validation:
- All request bodies are validated
- Required fields must be provided
- Status values are case-sensitive and must be exact

### Business Rules:
- Stock is automatically managed on order creation/cancellation
- Order status transitions have specific rules
- Shipping can only be added for existing orders
- Users can only access their own data (except admins)

---

## 📊 9. DASHBOARD ENDPOINTS
**🔒 Requires Admin Authentication**

### 9.1 Dashboard Overview
```http
GET /api/dashboard/overview?fromDate=2025-12-01&toDate=2025-12-10
Authorization: Bearer <admin_token>
```

### 9.2 Revenue Data
```http
GET /api/dashboard/revenue?fromDate=2025-12-01&toDate=2025-12-10&period=daily
Authorization: Bearer <admin_token>
```

### 9.3 Orders by Status
```http
GET /api/dashboard/orders-by-status?fromDate=2025-12-01&toDate=2025-12-10
Authorization: Bearer <admin_token>
```

### 9.4 Top Products
```http
GET /api/dashboard/top-products?fromDate=2025-12-01&toDate=2025-12-10&limit=10
Authorization: Bearer <admin_token>
```

### 9.5 Top Categories
```http
GET /api/dashboard/top-categories?fromDate=2025-12-01&toDate=2025-12-10&limit=5
Authorization: Bearer <admin_token>
```

### 9.6 Recent Orders
```http
GET /api/dashboard/recent-orders?limit=10
Authorization: Bearer <admin_token>
```

### 9.7 Complete Dashboard
```http
GET /api/dashboard/complete?fromDate=2025-12-01&toDate=2025-12-10
Authorization: Bearer <admin_token>
```

---

## 👥 10. USER MANAGEMENT ENDPOINTS

### 10.1 USER PROFILE ENDPOINTS
**🔒 Requires Authentication (Self-Access Only)**

#### 10.1.1 Get My Profile
```http
GET /api/users/profile
Authorization: Bearer <user_token>
```

#### 10.1.2 Update My Profile
```http
PUT /api/users/profile
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "081234567890",
  "address": "Updated Address"
}
```

#### 10.1.3 Get My Statistics
```http
GET /api/users/profile/stats
Authorization: Bearer <user_token>
```

### 10.2 ADMIN USER MANAGEMENT ENDPOINTS
**🔒 Requires Admin Authentication**

#### 10.2.1 Get All Users
```http
GET /api/users/admin/all
Authorization: Bearer <admin_token>
```

#### 10.2.2 Get User by ID
```http
GET /api/users/admin/{userId}
Authorization: Bearer <admin_token>
```

#### 10.2.3 Create New User
```http
POST /api/users/admin/create
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "phone": "081234567890",
  "role": "USER"
}
```

#### 10.2.4 Update User
```http
PUT /api/users/admin/{userId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "ADMIN"
}
```

#### 10.2.5 Delete User
```http
DELETE /api/users/admin/{userId}
Authorization: Bearer <admin_token>
```

#### 10.2.6 Get User Statistics
```http
GET /api/users/admin/{userId}/stats
Authorization: Bearer <admin_token>
```

### 10.3 Test Endpoint
```http
GET /api/users/test
```

---

**🎯 Total Endpoints: 50+**
- Authentication: 3
- Products: 5
- Categories: 3
- Cart: 6
- Addresses: 5
- Orders: 9
- Payments: 1
- Shipping: 6
- Dashboard: 7
- User Management: 8