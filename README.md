# WEbook — Vehicle Service Booking System

A full-stack, enterprise-grade web application for booking vehicle servicing appointments, tracking real-time maintenance workflows, and managing service center operations.

Built according to [Vehicle Service Booking System Architecture](Vehicle_Service_Booking_System_Architecture.md).

---

## 🌟 Highlights

- **Dual-Mode Database Connector**: Instant zero-config embedded MongoDB runner with automatic fallback, plus full production support for MongoDB Atlas.
- **Role-Based Access Control (RBAC)**:
  - **Customer**: Garage vehicle management, 4-step booking wizard, live slot reservation, downloadable/printable tax invoices, and 5-star review submission.
  - **Admin**: Operations control dashboard, booking confirmations, technician assignment, service catalog CRUD, and revenue metrics.
  - **Mechanic**: Workshop bay queue, job progress updater, diagnostic reports, and replacement parts installation log.
- **Smart Slot Capacity Engine**: Real-time bay occupancy tracking prevents overbooking.
- **Pre-Seeded Accounts with 1-Click Fast Login**: Instant evaluation directly on the login screen.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
REST API runs on `http://localhost:5000` with automated seed data on first boot.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Vite application runs on `http://localhost:5173`.

---

## 🔑 Demo Evaluation Credentials

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Customer** | `customer@webook.com` | `Customer@123` | Book services, manage vehicles, view invoices |
| **Admin** | `admin@webook.com` | `Admin@123` | Approve bookings, dispatch mechanics, view reports |
| **Mechanic** | `mechanic@webook.com` | `Mechanic@123` | Update job status, add diagnostic notes & parts |

---

## 📁 Repository Structure

```
WEbook/
├── backend/
│   ├── src/
│   │   ├── config/       # Database & environment configuration
│   │   ├── controllers/  # Auth, Vehicle, Service, Booking, Admin, Mechanic, Payment, Review
│   │   ├── middleware/   # JWT verification, Role-based guards, Error handler
│   │   ├── models/       # Mongoose Schemas (User, Vehicle, Service, Branch, Booking, Payment, Review)
│   │   ├── routes/       # Express route handlers
│   │   ├── utils/        # Automated seed dataset
│   │   ├── app.js        # Express app configuration
│   │   └── server.js     # Server entrypoint
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios instance with auth interceptors
│   │   ├── components/   # Common Navbar/Footer, Invoices, Reviews, Modals
│   │   ├── context/      # AuthContext & Toast notification provider
│   │   ├── pages/        # Home, Login, Register, Dashboard, Vehicles, Book, Admin, Mechanic
│   │   ├── index.css     # Luxury dark glassmorphism design system
│   │   ├── App.jsx       # Routing & RBAC guards
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── Vehicle_Service_Booking_System_Architecture.md
├── README.md
└── .gitignore
```

---

## 📜 License
Licensed under the MIT License.
