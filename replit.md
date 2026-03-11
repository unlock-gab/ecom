# متجر نوفا | Nova E-commerce Store

## Overview
A complete Arabic RTL e-commerce store with admin panel. Built with React + Express.js using in-memory storage.

## Features

### Customer Store
- **Homepage** (`/`): Hero section with animations, category grid, featured products, reviews, promotions
- **Products** (`/products`): Filterable/searchable product listing with sidebar categories
- **Product Detail** (`/products/:id`): Full product page with add to cart, wishlist, related products
- **Cart Drawer**: Slide-in cart with quantity management, persisted in localStorage
- **Checkout** (`/checkout`): Full checkout form with shipping/payment options
- **Order Success** (`/order-success/:id`): Order confirmation with status tracking

### Admin Panel
- **Dashboard** (`/admin`): Revenue stats, monthly charts, orders table
- **Products** (`/admin/products`): CRUD product management with modal form
- **Orders** (`/admin/orders`): Order listing with status update panel

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion, TanStack Query, Wouter
- **Backend**: Express.js, TypeScript, in-memory storage
- **UI**: Shadcn/UI components, Lucide icons, Recharts
- **Language**: Arabic (RTL), Cairo/Tajawal fonts

## Architecture
- `shared/schema.ts` - TypeScript types for Product, Order, Category, CartItem
- `server/storage.ts` - In-memory storage with 16 seeded products, 6 categories, 3 sample orders
- `server/routes.ts` - REST API: /api/products, /api/categories, /api/orders, /api/stats
- `client/src/context/CartContext.tsx` - Cart state management with localStorage persistence
- `client/src/components/` - Navbar, CartDrawer, ProductCard, Footer
- `client/src/pages/` - Home, Products, ProductDetail, Checkout, OrderSuccess
- `client/src/pages/admin/` - AdminDashboard, AdminProducts, AdminOrders, AdminLayout

## Design System
- Primary: Violet/Purple (#7c3aed)
- Accent: Fuchsia/Pink
- Dark admin theme (gray-950)
- Framer Motion animations throughout
- Responsive (mobile-first)

## API Endpoints
- `GET /api/products` - List products (supports ?category=, ?featured=, ?search=)
- `GET /api/products/:id` - Single product
- `POST /api/products` - Create product (admin)
- `PATCH /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `GET /api/categories` - List categories
- `GET /api/orders` - List orders (admin)
- `POST /api/orders` - Create order (checkout)
- `PATCH /api/orders/:id/status` - Update order status (admin)
- `GET /api/stats` - Dashboard statistics
