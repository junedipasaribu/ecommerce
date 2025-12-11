# 👥 User Management API Endpoints

## Overview
User management endpoints menyediakan functionality untuk user profile management dan admin user CRUD operations. User hanya bisa melihat dan mengubah data mereka sendiri, sedangkan admin memiliki akses penuh untuk manage semua user.

**Base URL**: `http://localhost:8081/api/users`

---

## 🔐 Security & Authorization

### User Endpoints (Self-Access Only):
- **Authentication**: Required (Bearer token)
- **Authorization**: User dapat mengakses data mereka sendiri saja
- **Endpoints**: `/api/users/profile/**`

### Admin Endpoints (Full Access):
- **Authentication**: Required (Bearer token)
- **Authorization**: Admin role required
- **Endpoints**: `/api/users/admin/**`

---

## 👤 1. USER PROFILE ENDPOINTS

### 1.1 Get My Profile
```http
GET /api/users/profile
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "081234567890",
  "address": "Jl. Merdeka No. 123",
  "role": "USER",
  "createdAt": "2025-12-01T10:30:00",
  "addresses": [
    {
      "id": 1,
      "recipientName": "John Doe",
      "phone": "081234567890",
      "street": "Jl. Merdeka No. 123",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "postalCode": "12345",
      "isPrimary": true,
      "createdAt": "2025-12-01T10:35:00"
    }
  ],
  "primaryAddress": {
    "id": 1,
    "recipientName": "John Doe",
    "phone": "081234567890",
    "street": "Jl. Merdeka No. 123",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postalCode": "12345",
    "isPrimary": true,
    "createdAt": "2025-12-01T10:35:00"
  },
  "stats": {
    "totalOrders": 15,
    "completedOrders": 12,
    "totalSpent": 2500000.0,
    "memberSince": "01 Dec 2025",
    "lastOrderDate": "10 Dec 2025"
  }
}
```

### 1.2 Update My Profile
```http
PUT /api/users/profile
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "081234567891",
  "address": "Jl. Merdeka No. 456"
}
```

**Note**: Email dan password tidak bisa diubah melalui endpoint ini untuk security reasons.

**Response:**
```json
{
  "id": 1,
  "name": "John Doe Updated",
  "email": "john@example.com",
  "phone": "081234567891",
  "address": "Jl. Merdeka No. 456",
  // ... rest of profile data
}
```

### 1.3 Get My Statistics
```http
GET /api/users/profile/stats
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "totalOrders": 15,
  "completedOrders": 12,
  "totalSpent": 2500000.0,
  "memberSince": "01 Dec 2025",
  "lastOrderDate": "10 Dec 2025"
}
```

---

## 🛡️ 2. ADMIN USER MANAGEMENT ENDPOINTS

### 2.1 Get All Users
```http
GET /api/users/admin/all
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "081234567890",
    "address": "Jl. Merdeka No. 123",
    "role": "USER",
    "createdAt": "2025-12-01T10:30:00",
    "addresses": [...],
    "primaryAddress": {...},
    "stats": {...}
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "081234567891",
    "address": "Jl. Sudirman No. 456",
    "role": "USER",
    "createdAt": "2025-12-02T11:00:00",
    "addresses": [...],
    "primaryAddress": {...},
    "stats": {...}
  }
]
```

### 2.2 Get User by ID
```http
GET /api/users/admin/{userId}
Authorization: Bearer <admin_token>
```

**Example:**
```http
GET /api/users/admin/1
Authorization: Bearer <admin_token>
```

**Response:** Same as Get My Profile format

### 2.3 Create New User
```http
POST /api/users/admin/create
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "phone": "081234567892",
  "address": "Jl. Gatot Subroto No. 789",
  "role": "USER",
  "password": "password123"
}
```

**Required Fields:**
- `name` (string)
- `email` (string, unique)
- `password` (string)

**Optional Fields:**
- `phone` (string)
- `address` (string)
- `role` (string: "USER" or "ADMIN", default: "USER")

**Response:**
```json
{
  "id": 3,
  "name": "New User",
  "email": "newuser@example.com",
  "phone": "081234567892",
  "address": "Jl. Gatot Subroto No. 789",
  "role": "USER",
  "createdAt": "2025-12-10T15:30:00",
  "addresses": [],
  "primaryAddress": null,
  "stats": {
    "totalOrders": 0,
    "completedOrders": 0,
    "totalSpent": 0.0,
    "memberSince": "10 Dec 2025",
    "lastOrderDate": "No orders yet"
  }
}
```

### 2.4 Update User
```http
PUT /api/users/admin/{userId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated User Name",
  "email": "updated@example.com",
  "phone": "081234567893",
  "address": "Updated Address",
  "role": "ADMIN",
  "password": "newpassword123"
}
```

**All fields are optional:**
- `name` (string)
- `email` (string, must be unique)
- `phone` (string)
- `address` (string)
- `role` (string: "USER" or "ADMIN")
- `password` (string, will be encrypted)

**Response:** Updated user data (same format as Get User)

### 2.5 Delete User
```http
DELETE /api/users/admin/{userId}
Authorization: Bearer <admin_token>
```

**Business Rules:**
- Cannot delete user with active orders (status: PENDING_PAYMENT, PAID, PROCESSING, SHIPPING)
- Can only delete users with completed/cancelled orders

**Success Response:**
```json
"User deleted successfully"
```

**Error Response (if user has active orders):**
```json
"Error deleting user: Cannot delete user with active orders"
```

### 2.6 Get User Statistics
```http
GET /api/users/admin/{userId}/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "totalOrders": 15,
  "completedOrders": 12,
  "totalSpent": 2500000.0,
  "memberSince": "01 Dec 2025",
  "lastOrderDate": "10 Dec 2025"
}
```

---

## 🔗 3. INTEGRATION WITH ADDRESS ENDPOINTS

User profile endpoints automatically include address data:

### Address Integration:
- **addresses**: List of all user addresses (sorted by primary first, then by creation date)
- **primaryAddress**: The primary address object (null if no primary address set)

### Relationship:
- User profile → includes addresses from `/api/addresses` endpoints
- Address management still uses existing `/api/addresses/**` endpoints
- No duplication of address CRUD functionality

---

## 🧪 4. TESTING SCENARIOS

### Scenario 1: User Profile Management
```bash
# 1. User login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# 2. Get profile
GET /api/users/profile
Authorization: Bearer <user_token>

# 3. Update profile
PUT /api/users/profile
Authorization: Bearer <user_token>
{
  "name": "Updated Name",
  "phone": "081234567890"
}

# 4. Get stats only
GET /api/users/profile/stats
Authorization: Bearer <user_token>
```

### Scenario 2: Admin User Management
```bash
# 1. Admin login
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

# 2. Get all users
GET /api/users/admin/all
Authorization: Bearer <admin_token>

# 3. Create new user
POST /api/users/admin/create
Authorization: Bearer <admin_token>
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123"
}

# 4. Update user
PUT /api/users/admin/1
Authorization: Bearer <admin_token>
{
  "role": "ADMIN"
}

# 5. Delete user (if no active orders)
DELETE /api/users/admin/1
Authorization: Bearer <admin_token>
```

---

## ⚠️ 5. ERROR HANDLING

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

**404 User Not Found:**
```json
"User not found: User with ID 999 does not exist"
```

**400 Email Already Exists:**
```json
"Error creating user: Email already exists"
```

**400 Missing Required Fields:**
```json
"Name, email, and password are required"
```

**400 Cannot Delete User:**
```json
"Error deleting user: Cannot delete user with active orders"
```

---

## 🔒 6. SECURITY FEATURES

### User Endpoints Security:
- ✅ Users can only access their own data (userId from JWT token)
- ✅ Limited update fields (no email/password change via profile)
- ✅ No access to other users' data

### Admin Endpoints Security:
- ✅ Admin role required for all admin endpoints
- ✅ Full CRUD access to all users
- ✅ Business rule validation (cannot delete users with active orders)
- ✅ Email uniqueness validation
- ✅ Password encryption

### Data Protection:
- ✅ Passwords are never returned in responses
- ✅ PIN fields are excluded from responses
- ✅ JWT token validation on all endpoints
- ✅ Role-based access control

---

## 📊 7. RESPONSE DATA STRUCTURE

### UserResponse Fields:
- `id`: User ID
- `name`: Full name
- `email`: Email address
- `phone`: Phone number
- `address`: Basic address (legacy field)
- `role`: USER or ADMIN
- `createdAt`: Registration date
- `addresses`: Array of CustomerAddress objects
- `primaryAddress`: Primary CustomerAddress object
- `stats`: UserStats object

### UserStats Fields:
- `totalOrders`: Total number of orders
- `completedOrders`: Number of completed orders
- `totalSpent`: Total amount spent (excluding cancelled orders)
- `memberSince`: Registration date (formatted)
- `lastOrderDate`: Last order date (formatted)

---

**🎯 Total User Endpoints: 8**
- User Profile: 3 endpoints
- Admin Management: 5 endpoints
- Test: 1 endpoint