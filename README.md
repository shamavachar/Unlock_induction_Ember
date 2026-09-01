# 🍔 Canteen Rush Manager

> **A real-time high-speed food ordering and queue management system designed for college canteens during rush hours.**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-black.svg)](https://socket.io/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-orange.svg)](http://localhost:5000/api-docs)

---

## 📌 Problem Statement

College canteens become heavily crowded during short break and lunch hours. Students face long, chaotic physical queues, while canteen staff struggle to manage multiple incoming orders, track stock availability, and update order statuses in real-time.

### 🎯 Objective
Provide a unified digital system that allows:
1. **Students** to view menus with live stock, place orders, receive unique sequential tokens (`CR-101`), and track their order status in real-time.
2. **Canteen Staff** to manage the incoming queue with strict state transitions (`Waiting` $\rightarrow$ `Preparing` $\rightarrow$ `Ready` $\rightarrow$ `Completed`), control stock inventory, and toggle unavailable items.
3. **Counter Display / TV Screen** to broadcast a live public "Now Serving" board.
4. **Canteen Chaos Twist Handling** to gracefully manage unexpected inventory drops (e.g., "only 3 items remaining") during peak rush.

---

## 🏗️ System Architecture

```
                                  ┌──────────────────────────────┐
                                  │       REACT CLIENT (Vite)    │
                                  │   (Student / Staff / TV)     │
                                  └──────────────┬───────────────┘
                                                 │
                                     HTTP / REST │ WebSocket (Socket.IO)
                                                 ▼
                                  ┌──────────────────────────────┐
                                  │       EXPRESS.JS SERVER      │
                                  │       (Node.js Runtime)      │
                                  └──────┬───────────────┬───────┘
                                         │               │
                            Mongoose ODM │               │ Socket.IO Emitter
                                         ▼               ▼
                        ┌──────────────────┐    ┌─────────────────┐
                        │     MONGODB      │    │  Connected TV & │
                        │  (Atlas / Local) │    │  Student Screen │
                        └──────────────────┘    └─────────────────┘
```

---

## 🌟 Core Features

### 🎓 1. Student Portal
- **Live Menu Browsing**: Filter by Category (Snacks, Meals, Beverages, etc.), Vegetarian/Non-Veg, or search by name.
- **Real-Time Stock Reflection**: Out-of-stock items are automatically disabled in real time.
- **Fast Order Placement**: Place orders with automatic token generation (`CR-101`, `CR-102`).
- **Live Order Tracking**: Track status (`Waiting` $\rightarrow$ `Preparing` $\rightarrow$ `Ready` $\rightarrow$ `Completed`), estimated wait time, and queue position (`"You are #2 in line"`).
- **Manual Authentication**: Students can sign up with name, email, roll number, and password, or place orders directly as guests.

### 👨‍🍳 2. Kitchen Staff Dashboard
- **Kanban Order Queue**: View active orders sorted by priority and arrival time (FIFO).
- **One-Click State Transitions**: Move orders smoothly through `Preparing` $\rightarrow$ `Ready` $\rightarrow$ `Completed`.
- **Live Inventory Manager**: Restock quantities, edit prices, add new dishes, or toggle availability.
- **Predefined Admin Login**: Staff logs in via pre-set admin credentials (`canteen_admin`).

### 📺 3. Counter Pickup TV Display (`/queue/live`)
- **"Now Serving" Screen**: Displays ready tokens for students to collect their food from the counter.
- **"Preparing" & "In Queue" Counters**: Shows active workload and average wait times.
- **Instant WebSocket Refresh**: Updates dynamically without page reloads.

### ⚡ 4. 60-Minute Hackathon Twist: "CANTEEN CHAOS!" Mode
- One-click trigger endpoint `POST /api/menu/chaos-mode`.
- Instantly marks all non-selected items as **Out of Stock** and locks the menu to only 3 remaining items.
- Broadcasts a real-time `canteen:chaos_alert` banner to all student screens and TV boards.
- Automatically prevents new orders for depleted items while preserving existing queue orders.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, Redux Toolkit, React Router v7, React Hook Form, Lucide Icons, Socket.io-client, Vanilla CSS |
| **Backend** | Node.js (v26+), Express.js 5.x, Socket.IO, Mongoose 9.x, Morgan, Cors, Dotenv |
| **Database** | MongoDB (Local / Atlas Cloud) |
| **Authentication** | Custom Manual JWT (JSON Web Tokens) + BcryptJS password hashing |
| **API Docs** | Swagger JSDoc & Swagger UI Express (OpenAPI 3.0) |

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB service running (`mongodb://127.0.0.1:27017`) OR MongoDB Atlas URI

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/shamavachar/Hackton.git
cd Hackton
```

---

### 2️⃣ Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables (.env)
# Create a .env file or copy from .env.example
```

#### Backend `.env` Configuration:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/canteen_rush
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# JWT Authentication
JWT_SECRET=canteen_rush_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d

# Predefined Admin/Staff Credentials
ADMIN_USERNAME=canteen_admin
ADMIN_PASSWORD=admin@canteen123
```

#### Seed Initial Menu Data & Start Backend:
```bash
# Populate 12 delicious canteen menu items
npm run seed

# Start server in development mode with nodemon
npm run dev
```
Backend will be live at: **`http://localhost:5000`**  
Interactive Swagger Docs at: **`http://localhost:5000/api-docs`**

---

### 3️⃣ Frontend Setup
Open a new terminal window:
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend will be live at: **`http://localhost:5173`**

---

## 📡 API Reference Overview

Full interactive API documentation is available at [`http://localhost:5000/api-docs`](http://localhost:5000/api-docs).

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | Student signup (`name, email, password, phone, rollNumber`) |
| `POST` | `/api/auth/login` | Public | Student login with email & password |
| `POST` | `/api/auth/admin/login` | Public | Staff login with predefined credentials |
| `GET` | `/api/auth/me` | Protected | Fetch current logged-in user profile |

### 🍔 Menu & Inventory (`/api/menu`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/menu` | Public | List menu items (`?availableOnly=true`, `?category=Snacks`, `?isVeg=true`) |
| `GET` | `/api/menu/categories` | Public | Get distinct categories list |
| `GET` | `/api/menu/:id` | Public | Get details of a single dish |
| `POST` | `/api/menu` | 🔒 Admin | Add new food item to menu |
| `PUT` | `/api/menu/:id` | 🔒 Admin | Update food details |
| `DELETE`| `/api/menu/:id` | 🔒 Admin | Delete food item |
| `PATCH`| `/api/menu/:id/toggle` | 🔒 Admin | Quick toggle available / out-of-stock |
| `PATCH`| `/api/menu/:id/stock` | 🔒 Admin | Restock / update physical inventory number |
| `POST` | `/api/menu/chaos-mode` | 🔒 Admin | Trigger "Canteen Chaos" (keeps only 3 items in stock) |

### 🧾 Orders & Queue (`/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/orders` | Public / Student | Place food order (Atomic stock deduction & unique token generation) |
| `GET` | `/api/orders` | 🔒 Admin | View active & historical orders (`?status=active`, `?search=CR-101`) |
| `GET` | `/api/orders/:id` | 🔒 Admin | View single order details |
| `GET` | `/api/orders/track/:tokenOrId`| Public | Track order status, queue position, & estimated wait time |
| `PATCH`| `/api/orders/:id/status` | 🔒 Admin | Transition order: `Waiting` $\rightarrow$ `Preparing` $\rightarrow$ `Ready` $\rightarrow$ `Completed` |
| `PATCH`| `/api/orders/:id/cancel` | 🔒 Admin | Cancel order and automatically restore stock |

### 📺 Live Queue & Stats (`/api/queue` & `/api/stats`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/queue/live` | Public | Counter TV Screen feed (Now Serving, Preparing, Waiting) |
| `GET` | `/api/stats/dashboard` | 🔒 Admin | Canteen metrics (today's revenue, active counts, top sellers) |

---

## ⚡ WebSocket Real-Time Events (Socket.IO)

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `order:created` | Server $\rightarrow$ Client | `Order Object` | Broadcast when new order is placed |
| `order:status_updated` | Server $\rightarrow$ Client | `{ _id, tokenNumber, status, ... }` | Broadcast on any order status transition |
| `menu:stock_updated` | Server $\rightarrow$ Client | `{ _id, name, stockQuantity, isAvailable }` | Broadcast when stock changes or item is toggled |
| `queue:updated` | Server $\rightarrow$ Client | `{ reason, tokenNumber, newStatus }` | Triggers TV counter refresh |
| `canteen:chaos_alert` | Server $\rightarrow$ Client | `{ title, announcement, remainingItems }` | Flashes emergency banner on all screens |

---

## 🧪 Automated Testing

Both comprehensive integration tests are included in the backend:
```bash
cd backend

# Test 1: Full Student + Staff + Stock Flow
node test_api.js

# Test 2: Complete Manual Authentication & Route Protection
node test_auth.js
```

---

## 📂 Project Structure

```
Hackton/
├── README.md                      # Project master guide (This file)
├── SCHEMA.md                      # Database schema, ER diagrams & state machines
├── .gitignore                     # Git tracking exclusions
│
├── backend/                       # Express + MongoDB + Socket.IO REST API
│   ├── .env                       # Backend environment configurations
│   ├── .env.example               # Example environment variables
│   ├── server.js                  # Entry point (HTTP + WebSockets + MongoDB)
│   ├── test_api.js                # Full flow automated test script
│   ├── test_auth.js               # Authentication & security test script
│   └── src/
│       ├── app.js                 # Express app & route middleware
│       ├── config/
│       │   ├── db.js              # Mongoose DB connection
│       │   └── swagger.js         # OpenAPI Swagger configuration
│       ├── controller/            # Business logic controllers
│       │   ├── authController.js
│       │   ├── menuController.js
│       │   ├── orderController.js
│       │   ├── queueController.js
│       │   └── statsController.js
│       ├── middleware/            # JWT Auth & error handling
│       │   ├── auth.js
│       │   └── errorHandler.js
│       ├── models/                # Mongoose Database models
│       │   ├── User.js
│       │   ├── MenuItem.js
│       │   ├── Order.js
│       │   └── TokenCounter.js
│       ├── routes/                # Express API routes with Swagger annotations
│       ├── seed/                  # Starter canteen food dataset
│       ├── sockets/               # Real-time Socket.IO handler
│       └── utils/                 # Wait time & queue estimators
│
└── client/                        # React 19 + Vite Frontend SPA
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── components/            # Reusable UI components & ChaosBanner
        ├── features/              # Feature modules (auth, menu, orders, admin, queue)
        ├── routes/                # Client-side router navigation
        ├── services/              # Axios API service & Socket.io client
        └── store/                 # Redux Toolkit global state store
```

---

## 👥 Default Credentials for Demo

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Canteen Staff (Admin)** | `canteen_admin` | `admin@canteen123` |
| **Sample Student Account** | `ananya@college.edu` (or register any) | `student123` |
| **Guest Student** | *No account required — direct order placement* | — |
