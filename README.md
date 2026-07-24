# 🅿️ ParkEase — Smart Parking Slot Booking System

> **Live Demo:** _[Link will be added here]_

ParkEase is a full-stack **MERN** web application that connects parking slot owners with drivers looking for convenient parking. It features **three distinct user roles** (Customer, Owner, Admin), real-time booking management, Cloudinary image uploads, dynamic pricing, and a premium dark-themed UI.

---

## 📑 Table of Contents

- [Live Demo](#-parkease--smart-parking-slot-booking-system)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Admin Seeding](#-admin-seeding)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## ✨ Features

### 👤 Customer (Driver)
- Register & login with JWT authentication
- Search available parking slots by **city name** (case-insensitive)
- View detailed slot information (address, size, vehicle compatibility, owner info, image)
- **Dynamic booking** — select start date/time + duration in **Hours, Days, or Weeks**
- Real-time **price calculator** shown before booking
- View all bookings on a personal dashboard
- **Cancel** pending/approved bookings with confirmation dialog
- Toast notifications for all actions

### 🏢 Owner (Parking Allotter)
- Register as an "Owner" role
- **Add new parking slots** with image upload (Cloudinary), address, city, size, vehicle type, and hourly rate
- View all owned slots with approval status
- **Remove/delete** parking slots they no longer want to list
- View **pending booking requests** from customers
- **Approve or Reject** each booking request
- Dashboard showing total earnings, pending request count, and active slot count

### 🛡️ Admin
- Pre-seeded admin account (`admin@parkease.com`)
- View **system-wide statistics**: total users, total slots, total bookings, total revenue
- View **all parking slots** (including unapproved ones)
- **Approve or Suspend** any slot listing
- Full management table with owner details and status indicators

### 🎨 UI/UX
- **Strictly dark theme** — pure black (`#000`) and dark gray (`#111`) palette, no purple/blue shades
- Responsive layout (mobile-first with Tailwind CSS breakpoints)
- Sticky navigation bar with custom favicon branding
- Lucide React icons throughout
- Hot toast notifications (bottom-right, dark styled)
- Smooth hover transitions and micro-animations
- Shadcn-inspired component styling

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library (component-based SPA) |
| **Vite 8** | Lightning-fast dev server & bundler |
| **React Router DOM 7** | Client-side routing |
| **Tailwind CSS 3** | Utility-first CSS framework |
| **Axios** | HTTP client for API calls |
| **Lucide React** | Modern icon library |
| **React Hot Toast** | Toast notification system |
| **jwt-decode** | Client-side JWT token decoding |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express 5** | Web framework for REST API |
| **Mongoose 9** | MongoDB ODM (Object Document Mapper) |
| **JSON Web Token (JWT)** | Stateless authentication |
| **bcryptjs** | Password hashing (10 salt rounds) |
| **Cloudinary** | Cloud image storage for slot photos |
| **Multer** | Multipart form-data parsing (file uploads) |
| **multer-storage-cloudinary** | Direct Multer-to-Cloudinary bridge |
| **CORS** | Cross-Origin Resource Sharing middleware |
| **dotenv** | Environment variable management |

### Database
| Technology | Purpose |
|---|---|
| **MongoDB Atlas** | Cloud-hosted NoSQL database |

### Dev Tools
| Technology | Purpose |
|---|---|
| **Nodemon** | Auto-restart server on file changes |
| **Concurrently** | Run client + server simultaneously |
| **PostCSS + Autoprefixer** | CSS processing pipeline for Tailwind |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│              React 19 + Vite + Tailwind                 │
│                   (Port 5173)                           │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Home    │ │  Login   │ │ Register │ │ SlotDetail│  │
│  │ (Search) │ │          │ │          │ │ (Booking) │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│  ┌──────────────────┐ ┌───────────┐ ┌───────────────┐  │
│  │ CustomerDashboard│ │ OwnerDash │ │ AdminDashboard│  │
│  └──────────────────┘ └───────────┘ └───────────────┘  │
│                         │                               │
│              Axios + JWT (Bearer Token)                 │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP REST API
                      ▼
┌─────────────────────────────────────────────────────────┐
│                       SERVER                            │
│              Express 5 + Node.js                        │
│                   (Port 5001)                           │
│                                                         │
│  Middleware:  CORS → JSON Parser → Auth (JWT) → Routes  │
│                                                         │
│  ┌───────────┐ ┌───────────┐ ┌────────────┐            │
│  │ authRoutes│ │ slotRoutes│ │bookingRoute│            │
│  └───────────┘ └───────────┘ └────────────┘            │
│  ┌────────────┐                                         │
│  │ adminRoutes│                                         │
│  └────────────┘                                         │
│           │                          │                  │
│     Mongoose ODM              Multer + Cloudinary       │
└───────────┬──────────────────────────┬──────────────────┘
            │                          │
            ▼                          ▼
   ┌────────────────┐        ┌────────────────┐
   │  MongoDB Atlas  │        │   Cloudinary   │
   │  (3 Collections)│        │  (Image CDN)   │
   └────────────────┘        └────────────────┘
```

### Request Flow

1. **User** interacts with the React frontend (port `5173`)
2. **Axios** sends HTTP requests to the Express API (port `5001`) with JWT in `Authorization` header
3. **Auth middleware** verifies the JWT token and attaches `req.user`
4. **Role-based middleware** (`restrictTo`) gates routes by role (`customer`, `owner`, `admin`)
5. **Controllers** execute business logic, interact with MongoDB via Mongoose
6. **Multer** handles file uploads, pipes them directly to **Cloudinary**
7. **Response** is sent back as JSON to the frontend

---

## 📊 Database Schema

### User Collection (`users`)

```
┌─────────────────────────────────────────────────────┐
│                     User                            │
├─────────────┬───────────┬───────────────────────────┤
│ Field       │ Type      │ Constraints               │
├─────────────┼───────────┼───────────────────────────┤
│ _id         │ ObjectId  │ Auto-generated (PK)       │
│ name        │ String    │ Required                  │
│ email       │ String    │ Required, Unique          │
│ password    │ String    │ Required (bcrypt hashed)   │
│ phone       │ String    │ Optional                  │
│ role        │ String    │ Enum: customer|owner|admin │
│             │           │ Default: "customer"       │
│ isApproved  │ Boolean   │ Default: false            │
│ createdAt   │ Date      │ Auto (timestamps: true)   │
│ updatedAt   │ Date      │ Auto (timestamps: true)   │
└─────────────┴───────────┴───────────────────────────┘
```

### ParkingSlot Collection (`parkingslots`)

```
┌─────────────────────────────────────────────────────────────┐
│                     ParkingSlot                             │
├──────────────────────┬───────────┬──────────────────────────┤
│ Field                │ Type      │ Constraints              │
├──────────────────────┼───────────┼──────────────────────────┤
│ _id                  │ ObjectId  │ Auto-generated (PK)      │
│ ownerId              │ ObjectId  │ Required, Ref → User     │
│ address              │ String    │ Required                 │
│ city                 │ String    │ Required                 │
│ slotSize             │ String    │ Enum: small|medium|large │
│                      │           │ Default: "medium"        │
│ vehicleCompatibility │ [String]  │ Enum: 2-wheeler|4-wheeler│
│ pricePerHour         │ Number    │ Required                 │
│ image                │ String    │ Cloudinary URL           │
│ isAvailable          │ Boolean   │ Default: true            │
│ isApproved           │ Boolean   │ Default: false           │
│ createdAt            │ Date      │ Auto (timestamps: true)  │
│ updatedAt            │ Date      │ Auto (timestamps: true)  │
└──────────────────────┴───────────┴──────────────────────────┘
```

### Booking Collection (`bookings`)

```
┌─────────────────────────────────────────────────────────────┐
│                     Booking                                 │
├──────────────┬───────────┬──────────────────────────────────┤
│ Field        │ Type      │ Constraints                      │
├──────────────┼───────────┼──────────────────────────────────┤
│ _id          │ ObjectId  │ Auto-generated (PK)              │
│ slotId       │ ObjectId  │ Required, Ref → ParkingSlot      │
│ customerId   │ ObjectId  │ Required, Ref → User             │
│ ownerId      │ ObjectId  │ Required, Ref → User             │
│ startTime    │ Date      │ Required                         │
│ endTime      │ Date      │ Required                         │
│ totalPrice   │ Number    │ Required (auto-calculated)       │
│ status       │ String    │ Enum: pending|approved|rejected  │
│              │           │       |completed|cancelled       │
│              │           │ Default: "pending"               │
│ createdAt    │ Date      │ Auto (timestamps: true)          │
│ updatedAt    │ Date      │ Auto (timestamps: true)          │
└──────────────┴───────────┴──────────────────────────────────┘
```

### Entity Relationship Diagram

```
┌──────────┐       1:N       ┌──────────────┐       1:N       ┌──────────┐
│   User   │────────────────▶│  ParkingSlot │◀───────────────│  Booking  │
│ (Owner)  │  ownerId        │              │  slotId        │          │
└──────────┘                 └──────────────┘                └──────────┘
                                                                   │
┌──────────┐       1:N                                             │
│   User   │──────────────────────────────────────────────────────▶│
│(Customer)│  customerId                                           │
└──────────┘                                                       │
                                                                   │
┌──────────┐       (reads all)                                     │
│   User   │──────────────────────────── reads ──────────────────▶│
│ (Admin)  │  system-wide access                                   │
└──────────┘
```

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Register a new user (customer/owner) |
| `POST` | `/api/auth/login` | Public | Login and receive JWT token |

### Parking Slots (`/api/slots`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/slots` | Public | Get all approved & available slots (supports `?city=` query) |
| `GET` | `/api/slots/my-slots` | Owner | Get all slots owned by the logged-in owner |
| `GET` | `/api/slots/:id` | Public | Get a single slot by ID |
| `POST` | `/api/slots` | Owner | Add a new parking slot (multipart form with image) |
| `DELETE` | `/api/slots/:id` | Owner | Delete a parking slot owned by the user |

### Bookings (`/api/bookings`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/bookings` | Customer | Create a new booking request |
| `GET` | `/api/bookings/my-bookings` | Customer | Get all bookings for the logged-in customer |
| `GET` | `/api/bookings/requests` | Owner | Get all booking requests for the owner's slots |
| `PATCH` | `/api/bookings/:id/status` | Owner | Approve/reject/complete a booking |
| `DELETE` | `/api/bookings/:id` | Customer | Cancel a pending or approved booking |

### Admin (`/api/admin`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/admin/stats` | Admin | Get system-wide statistics (users, slots, bookings, revenue) |
| `GET` | `/api/admin/slots` | Admin | Get all slots including unapproved |
| `PATCH` | `/api/admin/slots/:id/approve` | Admin | Approve or suspend a parking slot listing |

---

## 📁 Project Structure

```
ParkEase/
├── package.json                  # Root: concurrently script (dev:all)
│
├── server/                       # ── Backend (Express + Node.js) ──
│   ├── server.js                 # Entry point: Express app, DB connect, route mounting
│   ├── seedAdmin.js              # One-time script to create admin account
│   ├── .env                      # Environment variables (not committed)
│   ├── package.json              # Server dependencies
│   │
│   ├── models/
│   │   ├── User.js               # User schema (name, email, password, role, isApproved)
│   │   ├── ParkingSlot.js         # Parking slot schema (address, city, size, price, image)
│   │   └── Booking.js            # Booking schema (slot, customer, owner, times, price, status)
│   │
│   ├── controllers/
│   │   ├── authController.js     # Register & Login (bcrypt + JWT)
│   │   ├── slotController.js     # CRUD for parking slots
│   │   ├── bookingController.js  # Create, read, update status, cancel bookings
│   │   └── adminController.js    # Stats, slot management, approvals
│   │
│   ├── routes/
│   │   ├── authRoutes.js         # POST /register, POST /login
│   │   ├── slotRoutes.js         # GET/POST/DELETE slots
│   │   ├── bookingRoutes.js      # GET/POST/PATCH/DELETE bookings
│   │   └── adminRoutes.js        # GET stats, GET/PATCH slots (admin-only)
│   │
│   ├── middleware/
│   │   └── auth.js               # JWT verification + role-based access (restrictTo)
│   │
│   └── utils/
│       └── upload.js             # Cloudinary + Multer config for image uploads
│
├── client/                       # ── Frontend (React + Vite) ──
│   ├── index.html                # HTML entry point with favicon
│   ├── vite.config.js            # Vite configuration (React plugin)
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── postcss.config.js         # PostCSS plugins
│   ├── package.json              # Client dependencies
│   │
│   ├── public/
│   │   └── favicon.png           # Custom ParkEase favicon
│   │
│   └── src/
│       ├── main.jsx              # React DOM root entry point
│       ├── App.jsx               # Router setup & route definitions
│       ├── index.css             # Global styles + Tailwind directives
│       │
│       ├── context/
│       │   └── AuthContext.jsx   # React Context for auth state (login, register, logout)
│       │
│       ├── components/
│       │   └── Navbar.jsx        # Sticky top navbar with logo, dashboard link, logout
│       │
│       ├── pages/
│       │   ├── Home.jsx              # Landing page + slot search by city
│       │   ├── Login.jsx             # Login form (email + password)
│       │   ├── Register.jsx          # Registration form (name, email, password, phone, role)
│       │   ├── SlotDetails.jsx       # Slot detail view + dynamic booking form
│       │   ├── Dashboard.jsx         # Role-based dashboard router
│       │   ├── CustomerDashboard.jsx # Customer bookings + cancel feature
│       │   ├── OwnerDashboard.jsx    # Owner slots, requests, approve/reject, delete slot
│       │   ├── AdminDashboard.jsx    # Admin stats + slot approval table
│       │   └── AddSlot.jsx           # Form to create a new parking slot (with image upload)
│       │
│       └── utils/
│           └── api.js            # Axios instance with baseURL + JWT interceptor
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ installed
- **npm** v9+ installed
- A **MongoDB Atlas** account (free tier works)
- A **Cloudinary** account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/anasghayas/ParkEase.git
cd ParkEase
```

### 2. Install Dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

cd ..
```

### 3. Configure Environment Variables

Create a `.env` file inside the `server/` directory:

```bash
# server/.env

PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_key_here

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **MongoDB Atlas Setup:**
> 1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
> 2. Create a database user
> 3. Under **Network Access**, add `0.0.0.0/0` to allow connections from anywhere
> 4. Copy the connection string and paste it as `MONGO_URI`

> **Cloudinary Setup:**
> 1. Sign up at [cloudinary.com](https://cloudinary.com)
> 2. Copy your Cloud Name, API Key, and API Secret from the Dashboard

### 4. Seed the Admin Account

```bash
cd server
node seedAdmin.js
cd ..
```

This creates:
- **Email:** `admin@parkease.com`
- **Password:** `admin123`

### 5. Run the Application

```bash
npm run dev:all
```

This uses **concurrently** to start both:
- 🖥️ **Server** → `http://localhost:5001` (Express + Nodemon)
- 🌐 **Client** → `http://localhost:5173` (Vite dev server)

---

## 🔐 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend server port | `5001` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/parkease` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `my_super_secret_key` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `mycloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abcdef123` |

---

## 👑 Admin Seeding

The admin account is **not** registered through the UI — it is seeded directly into the database using a script:

```bash
cd server
node seedAdmin.js
```

| Field | Value |
|---|---|
| **Email** | `admin@parkease.com` |
| **Password** | `admin123` |
| **Role** | `admin` |

---

## 🔒 Authentication Flow

1. User registers or logs in → server returns a **JWT token** (expires in 30 days)
2. Token is stored in **localStorage** on the client
3. Every API request includes the token in the `Authorization: Bearer <token>` header via an **Axios interceptor**
4. Server **auth middleware** verifies the token and attaches `req.user` (containing `id`, `role`, `name`)
5. **restrictTo middleware** checks if the user's role matches the required role for that route

---

## 📸 Screenshots

> _Screenshots will be added after deployment_

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  Built with ❤️ by <strong>Anas Ghayas</strong>
</p>
