# ParkEase — Project Report

## Smart Parking Slot Booking System

**Submitted by:** Anas Ghayas  
**Date:** July 2026  
**Repository:** [github.com/anasghayas/ParkEase](https://github.com/anasghayas/ParkEase)  
**Live Demo:** _[Link will be added]_

---

## 1. Introduction

### 1.1 Problem Statement

Urban areas face a growing parking crisis. Drivers waste an average of 15–20 minutes searching for parking spots, leading to wasted fuel, increased traffic congestion, and frustration. At the same time, private parking space owners lack a convenient platform to monetize their unused spaces. There is no centralized system that connects drivers to available parking spaces in real time.

### 1.2 Proposed Solution

**ParkEase** is a web-based Smart Parking Slot Booking System that bridges the gap between parking space owners and drivers. It provides:

- A **marketplace** where owners can list their parking spaces with photos, pricing, and location details
- A **search and booking system** for drivers to find, compare, and reserve parking slots
- An **admin panel** for platform oversight, slot approvals, and revenue tracking
- A **role-based access control** system ensuring secure, appropriate access for each user type

### 1.3 Objectives

1. Design and develop a full-stack web application using the MERN stack
2. Implement three distinct user roles: Customer, Owner, and Admin
3. Enable real-time search, dynamic pricing, and booking management
4. Integrate cloud-based image storage for parking slot photos
5. Build a premium, responsive dark-themed user interface
6. Implement secure JWT-based authentication with role-based authorization

---

## 2. Literature Review / Background

### 2.1 Existing Systems

| System | Limitations |
|---|---|
| ParkMobile | Commercial app, not open-source, limited to specific cities |
| SpotHero | Focused on commercial lots, no peer-to-peer rental |
| JustPark (UK) | Region-specific, complex pricing |

### 2.2 Technology Rationale

The **MERN stack** (MongoDB, Express.js, React, Node.js) was selected because:

- **JavaScript end-to-end** reduces context switching between frontend and backend
- **MongoDB's** flexible document model fits the varying attributes of parking slots
- **React's** component-based architecture enables reusable UI components
- **Express.js** provides a minimal, unopinionated framework for RESTful APIs
- **Vite** was chosen over Create React App for its significantly faster development server and build times

---

## 3. System Design

### 3.1 Architecture

ParkEase follows a **three-tier architecture**:

| Tier | Technology | Responsibility |
|---|---|---|
| **Presentation** | React + Vite + Tailwind CSS | User interface, routing, state management |
| **Business Logic** | Express.js + Node.js | REST API, authentication, authorization, business rules |
| **Data** | MongoDB Atlas + Cloudinary | Data persistence, image storage |

### 3.2 Design Patterns Used

| Pattern | Where Used |
|---|---|
| **MVC (Model-View-Controller)** | Backend: Models (Mongoose schemas), Views (React components), Controllers (Express handlers) |
| **Repository Pattern** | Mongoose models abstract database access |
| **Middleware Chain** | Express middleware for auth, CORS, JSON parsing, role gating |
| **Context API** | React Context for global authentication state |
| **Interceptor Pattern** | Axios request interceptor auto-attaches JWT to every request |

### 3.3 Database Design

#### Entity Relationship Diagram

```
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│      USER        │          │   PARKING SLOT   │          │     BOOKING      │
├──────────────────┤          ├──────────────────┤          ├──────────────────┤
│ _id (PK)         │──1:N──▶ │ _id (PK)         │◀──N:1──│ _id (PK)         │
│ name             │          │ ownerId (FK→User)│          │ slotId (FK→Slot) │
│ email (UNIQUE)   │          │ address          │          │ customerId(FK→U) │
│ password (hash)  │          │ city             │          │ ownerId (FK→User)│
│ phone            │          │ slotSize         │          │ startTime        │
│ role             │──1:N──▶ │ vehicleCompat[]  │          │ endTime          │
│ isApproved       │          │ pricePerHour     │          │ totalPrice       │
│ createdAt        │          │ image (URL)      │          │ status           │
│ updatedAt        │          │ isAvailable      │          │ createdAt        │
└──────────────────┘          │ isApproved       │          │ updatedAt        │
         │                    │ createdAt        │          └──────────────────┘
         │                    │ updatedAt        │                   ▲
         │                    └──────────────────┘                   │
         │                                                          │
         └──────────────────────────── 1:N ─────────────────────────┘
                              (as customer)
```

#### Collection Schemas

**Users Collection:**

| Field | Type | Validation |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `name` | String | Required |
| `email` | String | Required, Unique index |
| `password` | String | Required, bcrypt hashed (10 rounds) |
| `phone` | String | Optional |
| `role` | String | Enum: `customer`, `owner`, `admin`. Default: `customer` |
| `isApproved` | Boolean | Default: `false` (owners need admin approval) |
| `createdAt` | Date | Auto-generated |
| `updatedAt` | Date | Auto-generated |

**ParkingSlots Collection:**

| Field | Type | Validation |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `ownerId` | ObjectId | Required, references `User` |
| `address` | String | Required |
| `city` | String | Required |
| `slotSize` | String | Enum: `small`, `medium`, `large`. Default: `medium` |
| `vehicleCompatibility` | [String] | Enum values: `2-wheeler`, `4-wheeler` |
| `pricePerHour` | Number | Required |
| `image` | String | Cloudinary URL |
| `isAvailable` | Boolean | Default: `true` |
| `isApproved` | Boolean | Default: `false` (requires admin approval) |
| `createdAt` | Date | Auto-generated |
| `updatedAt` | Date | Auto-generated |

**Bookings Collection:**

| Field | Type | Validation |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `slotId` | ObjectId | Required, references `ParkingSlot` |
| `customerId` | ObjectId | Required, references `User` |
| `ownerId` | ObjectId | Required, references `User` |
| `startTime` | Date | Required |
| `endTime` | Date | Required |
| `totalPrice` | Number | Required, auto-calculated from duration × pricePerHour |
| `status` | String | Enum: `pending`, `approved`, `rejected`, `completed`, `cancelled`. Default: `pending` |
| `createdAt` | Date | Auto-generated |
| `updatedAt` | Date | Auto-generated |

---

## 4. Implementation

### 4.1 Authentication & Authorization

**Registration Flow:**
1. User submits name, email, password, phone, and role
2. Server checks for duplicate email
3. Password is hashed using **bcryptjs** with 10 salt rounds
4. User document is created with `isApproved: false` for owners, `true` for customers
5. A **JWT token** is generated (signed with `JWT_SECRET`, expires in 30 days) containing `{ id, role, name, isApproved }`
6. Token is returned to the client and stored in `localStorage`

**Login Flow:**
1. User submits email and password
2. Server finds user by email and compares password hash
3. On match, a JWT token is returned

**Authorization Middleware:**
```
Request → auth() → restrictTo('role') → Controller
```
- `auth()`: Extracts JWT from `Authorization: Bearer <token>`, verifies it, attaches `req.user`
- `restrictTo(...roles)`: Checks if `req.user.role` is in the allowed roles array

### 4.2 Parking Slot Management

**Creating a Slot (Owner):**
1. Owner fills out a form with address, city, slot size, vehicle compatibility, price, and an optional image
2. Image is uploaded via **Multer** which pipes directly to **Cloudinary** using `multer-storage-cloudinary`
3. Cloudinary returns a CDN URL which is stored in the `image` field
4. Slot is created with `isApproved: false` — it won't appear in search until the admin approves it

**Searching Slots (Customer):**
- `GET /api/slots?city=<name>` performs a case-insensitive regex search on the `city` field
- Only slots with `isApproved: true` and `isAvailable: true` are returned

**Deleting a Slot (Owner):**
- Owner can delete their own slots via `DELETE /api/slots/:id`
- Server verifies the slot's `ownerId` matches the logged-in user's ID before deletion

### 4.3 Booking System

**Creating a Booking (Customer):**
1. Customer selects a **start date/time** using a datetime picker
2. Customer selects **duration** (number) and **unit** (Hours, Days, or Weeks)
3. Frontend calculates total hours and displays **estimated price** in real-time before submission
4. On submission, server calculates `totalPrice = hours × slot.pricePerHour` and creates a booking with status `pending`

**Booking Lifecycle:**
```
pending → approved (by owner)  → completed (by owner)
       → rejected (by owner)
       → cancelled (by customer — via DELETE)
```

**Cancelling a Booking (Customer):**
- Customer can cancel bookings that are `pending` or `approved`
- Cannot cancel `completed` or `rejected` bookings

### 4.4 Admin Panel

**Dashboard Statistics:**
- Total users (count of all documents in `users` collection)
- Total parking slots (count of all documents in `parkingslots` collection)
- Total bookings (count of all documents in `bookings` collection)
- Total revenue (MongoDB aggregation pipeline summing `totalPrice` of `approved` and `completed` bookings)

**Slot Approval:**
- Admin sees ALL slots (including unapproved) in a table
- Each row has an Approve/Suspend toggle button
- Approving a slot sets `isApproved: true`, making it visible in search

### 4.5 Image Upload Pipeline

```
Client Form (multipart/form-data)
        │
        ▼
   Multer middleware (parses file from request body)
        │
        ▼
   CloudinaryStorage (uploads file to Cloudinary CDN)
        │
        ▼
   Returns secure HTTPS URL
        │
        ▼
   Stored in ParkingSlot.image field
```

- **Allowed formats:** JPG, PNG, JPEG
- **Storage folder:** `parkease_slots/` on Cloudinary
- **Benefits:** No local disk storage needed, CDN-served images for fast loading

### 4.6 Frontend Architecture

**State Management:**
- **AuthContext** (React Context API) manages global authentication state
- `user`, `login()`, `register()`, `logout()`, `loading` are provided to all components
- JWT token is decoded on the client side using `jwt-decode` to extract user info

**Routing:**
| Route | Component | Access |
|---|---|---|
| `/` | Home | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/slot/:id` | SlotDetails | Public |
| `/dashboard` | Dashboard (role router) | Authenticated |
| `/add-slot` | AddSlot | Owner |

**Role-Based Dashboard:**
The `/dashboard` route renders a different component based on `user.role`:
- `customer` → `CustomerDashboard`
- `owner` → `OwnerDashboard`
- `admin` → `AdminDashboard`

---

## 5. Technology Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | React | 19.2.8 |
| Build Tool | Vite | 8.1.1 |
| CSS Framework | Tailwind CSS | 3.4.15 |
| HTTP Client | Axios | 1.18.1 |
| Routing | React Router DOM | 7.18.1 |
| Icons | Lucide React | 1.25.0 |
| Notifications | React Hot Toast | 2.6.0 |
| JWT Decoding | jwt-decode | 4.0.0 |
| Runtime | Node.js | 24.x |
| Server Framework | Express | 5.2.1 |
| Database ODM | Mongoose | 9.8.0 |
| Authentication | JSON Web Token | 9.0.3 |
| Password Hashing | bcryptjs | 3.0.3 |
| Image Upload | Cloudinary + Multer | 1.41.3 / 2.2.0 |
| Database | MongoDB Atlas | Cloud |
| Image CDN | Cloudinary | Cloud |
| Dev Server (Backend) | Nodemon | 3.1.14 |
| Concurrent Runner | Concurrently | 10.0.3 |

---

## 6. Features Implemented

| # | Feature | Description |
|---|---|---|
| 1 | User Registration | Multi-role registration (Customer or Owner) with form validation |
| 2 | User Login | JWT-based login with token persistence in localStorage |
| 3 | Role-Based Access Control | Three roles (customer, owner, admin) with route-level protection |
| 4 | Parking Slot Listing | Owners can add slots with address, city, size, vehicle type, price, and photo |
| 5 | Cloudinary Image Upload | Slot images uploaded to cloud CDN via Multer + Cloudinary pipeline |
| 6 | Slot Search | Customers search by city name (case-insensitive regex matching) |
| 7 | Slot Detail View | Full slot information page with owner info and booking form |
| 8 | Dynamic Duration Booking | Select start date/time, duration amount, and unit (Hours/Days/Weeks) |
| 9 | Real-Time Price Calculator | Estimated total price updates instantly as duration changes |
| 10 | Booking Request System | Customers request bookings, owners approve/reject |
| 11 | Booking Cancellation | Customers can cancel their own pending or approved bookings |
| 12 | Slot Deletion | Owners can remove their own parking slots |
| 13 | Admin Dashboard | System-wide stats (users, slots, bookings, revenue) |
| 14 | Slot Approval System | Admin approves/suspends slot listings before they appear in search |
| 15 | Owner Earnings Tracking | Dashboard shows total earnings from approved/completed bookings |
| 16 | Custom Branding | Custom favicon integrated in navbar and browser tab |
| 17 | Dark Theme | Consistent black/dark-gray theme across all pages |
| 18 | Responsive Design | Mobile-friendly layouts using Tailwind CSS breakpoints |
| 19 | Toast Notifications | Visual feedback for all user actions (success/error) |
| 20 | Admin Account Seeding | CLI script to create admin account directly in database |

---

## 7. Testing & Validation

### 7.0 Demo Accounts

The following accounts are pre-registered in the system for testing:

| Role | Email | Password |
|---|---|---|
| 🛡️ Admin | `admin@parkease.com` | `admin123` |
| 🏢 Parking Owner | `p@example.com` | `123456` |
| 🚗 Driver (Customer) | `d@example.com` | `123456` |

### 7.1 API Testing

All 14 API endpoints were tested using direct HTTP requests:

| Endpoint | Method | Test Result |
|---|---|---|
| `/api/auth/register` | POST | ✅ Successfully creates users with hashed passwords |
| `/api/auth/login` | POST | ✅ Returns valid JWT token |
| `/api/slots` | GET | ✅ Returns only approved, available slots |
| `/api/slots?city=jamshedpur` | GET | ✅ Case-insensitive city filtering works |
| `/api/slots/my-slots` | GET | ✅ Returns only owner's slots |
| `/api/slots/:id` | GET | ✅ Returns single slot with populated owner |
| `/api/slots` | POST | ✅ Creates slot with Cloudinary image |
| `/api/slots/:id` | DELETE | ✅ Deletes only owner's own slot |
| `/api/bookings` | POST | ✅ Creates booking with calculated price |
| `/api/bookings/my-bookings` | GET | ✅ Returns customer's bookings |
| `/api/bookings/requests` | GET | ✅ Returns owner's booking requests |
| `/api/bookings/:id/status` | PATCH | ✅ Updates booking status |
| `/api/bookings/:id` | DELETE | ✅ Cancels pending/approved bookings |
| `/api/admin/stats` | GET | ✅ Returns aggregated statistics |

### 7.2 Security Testing

| Test | Result |
|---|---|
| Access protected route without token | ✅ Returns 401 Unauthorized |
| Access owner route as customer | ✅ Returns 403 Forbidden |
| Access admin route as owner | ✅ Returns 403 Forbidden |
| Delete another owner's slot | ✅ Returns 404 (ownership check) |
| Cancel another customer's booking | ✅ Returns 404 (ownership check) |
| Login with wrong password | ✅ Returns 400 Invalid credentials |
| Register duplicate email | ✅ Returns 400 User already exists |

---

## 8. Challenges Faced & Solutions

| # | Challenge | Solution |
|---|---|---|
| 1 | Vite initialized as Vanilla TypeScript instead of React | Manually reconfigured `index.html`, created `main.jsx`, and installed React dependencies |
| 2 | Express route `/:id` intercepting `/my-slots` | Reordered routes: placed `/my-slots` before `/:id` in slotRoutes.js |
| 3 | White screen crash on booking success | Fixed missing `CheckCircle2` import in SlotDetails.jsx |
| 4 | Booking hardcoded to 2 hours only | Built dynamic duration selector with Hours/Days/Weeks dropdown and real-time price calculator |
| 5 | Owner dashboard not showing pending requests | Fixed Express route ordering bug (see #2 above) |
| 6 | MongoDB Atlas connection failing | Added `0.0.0.0/0` to MongoDB Atlas Network Access whitelist |
| 7 | Cloudinary image uploads not working | Configured `multer-storage-cloudinary` with correct environment variables |

---

## 9. Future Enhancements

1. **Map Integration** — Show parking slot locations on an interactive map (Google Maps / Leaflet)
2. **Payment Gateway** — Integrate Razorpay/Stripe for online payments
3. **Real-Time Notifications** — WebSocket-based live booking notifications
4. **Review System** — Allow customers to rate and review parking slots
5. **Auto-Expiry** — Automatically mark bookings as completed after endTime
6. **Email Notifications** — Send confirmation emails on booking, approval, and cancellation
7. **Advanced Search Filters** — Filter by price range, slot size, vehicle type
8. **Booking Calendar** — Visual calendar view for owners to see upcoming bookings
9. **Analytics Dashboard** — Charts and graphs for admin (booking trends, revenue over time)
10. **Mobile App** — React Native version for iOS/Android

---

## 10. Conclusion

ParkEase successfully demonstrates a full-stack web application solving a real-world urban mobility problem. The system implements a complete booking lifecycle from slot listing and discovery through approval, reservation, and cancellation. The three-role architecture (Customer, Owner, Admin) provides appropriate access and functionality to each stakeholder.

Key technical achievements include:
- **Secure authentication** with JWT and bcrypt
- **Cloud-native image storage** with Cloudinary
- **Dynamic pricing calculations** supporting multiple time units
- **Role-based authorization** at both API and UI levels
- **Real-time search** with case-insensitive regex matching
- **Premium dark-themed UI** with responsive design

The modular MERN architecture allows for easy future extension with features like map integration, payment processing, and real-time notifications.

---

## 11. References

1. MongoDB Documentation — [docs.mongodb.com](https://docs.mongodb.com)
2. Express.js Guide — [expressjs.com](https://expressjs.com)
3. React Documentation — [react.dev](https://react.dev)
4. Vite Documentation — [vite.dev](https://vite.dev)
5. Tailwind CSS — [tailwindcss.com](https://tailwindcss.com)
6. Cloudinary Documentation — [cloudinary.com/documentation](https://cloudinary.com/documentation)
7. JSON Web Tokens — [jwt.io](https://jwt.io)
8. Mongoose ODM — [mongoosejs.com](https://mongoosejs.com)
9. Multer Documentation — [github.com/expressjs/multer](https://github.com/expressjs/multer)
10. Lucide Icons — [lucide.dev](https://lucide.dev)

---

<p align="center">
  <strong>ParkEase</strong> — Smart Parking Slot Booking System<br/>
  © 2026 Anas Ghayas. All rights reserved.
</p>
