# Project Structure

## Root Configuration
- `vite.config.js` - Vite build configuration
- `eslint.config.js` - ESLint rules and settings
- `.env` - Environment variables (not committed)
- `index.html` - Entry HTML file
- `package.json` - Dependencies and scripts

## Source Organization (`src/`)

### Entry Point
- `main.jsx` - Application entry, imports Bootstrap CSS/JS and renders App
- `App.jsx` - Root component with routing configuration

### Pages (`src/pages/`)
Page components for each route:
- `Dashboard.jsx` - Analytics and overview
- `Products.jsx` - Product management
- `Categories.jsx` - Category management
- `Orders.jsx` - Order management
- `Shipping.jsx` - Shipping management
- `Users.jsx` - User listing
- `EditUserRoles.jsx` - Role/permission editor
- `Login.jsx` - Authentication
- `Register.jsx` - User registration

### Components (`src/components/`)
Reusable UI components:
- `Layout.jsx` - Main app layout wrapper (sidebar, header, etc.)
- `RequireAuth.jsx` - Protected route wrapper for authentication

### Context (`src/context/`)
React Context providers:
- `AuthContext.jsx` - Authentication state, login/logout, user/token management

### Services (`src/services/`)
API integration layer - all services follow consistent patterns:
- `api.js` - Axios instance with auth interceptors
- `auth.js` - Authentication endpoints
- `products.js` - Product CRUD operations
- `categories.js` - Category operations
- `orders.js` - Order operations
- `shipping.js` - Shipping operations
- `users.js` - User management
- `dashboard.js` - Dashboard data
- `Permission.js` - Permission definitions
- `RoleDefaults.js` - Default role configurations

### Utils (`src/utils/`)
Helper functions:
- `hasPermission.js` - Permission checking utility

### Assets (`src/assets/`)
Static files:
- `images/` - Application images and logos
- `react.svg` - React logo

## Architecture Patterns

### Service Layer Pattern
All services export an object with methods (getAll, getById, create, update, remove) and use:
- `handleError()` - Standardized error handling
- `extractData()` - Normalize API response structure

### Authentication Flow
1. Token stored in localStorage under "auth" key
2. Axios interceptor attaches Bearer token to requests
3. AuthContext provides user state globally
4. RequireAuth component protects routes

### Routing Structure
- Public routes: `/login`, `/register`
- Protected routes: All others wrapped in `<RequireAuth>` and nested under `<Layout>`
- Layout uses React Router's `<Outlet>` pattern

## Conventions
- Use `.jsx` extension for React components
- Use `.js` for non-component JavaScript
- Component files use PascalCase naming
- Service files use camelCase naming
- All imports use relative paths from `src/`
