# Vehicle Service Booking System — Full Project Architecture

**Project:** Mini Project — Vehicle Service Booking System
**Type:** Full Stack Web Application
**Author:** Francis Fernando V

---

## 1. Project Overview

The Vehicle Service Booking System is a web application that allows customers to book vehicle servicing appointments online, track service status, and manage their vehicle history. Admins/mechanics manage bookings, services, and schedules through a dashboard.

### 1.1 Objective
- Eliminate manual/phone-based booking for vehicle service centers.
- Provide customers a self-service portal to book, track, and pay for services.
- Give service center staff a dashboard to manage bookings, slots, mechanics, and inventory of services.

### 1.2 Target Users
| Role | Description |
|---|---|
| **Customer** | Registers, adds vehicles, books service, tracks status, views history/invoices |
| **Admin** | Manages service catalog, pricing, slots, mechanics, and views all bookings |
| **Mechanic/Staff** | Views assigned jobs, updates job status |

---

## 2. Functional Requirements

### 2.1 Customer Module
- Register/Login (email + password, optional OTP/Google OAuth)
- Add/edit/delete vehicles (make, model, year, registration number, fuel type)
- Browse service catalog (basic service, full service, tyre change, AC service, etc.)
- Select service center/branch (if multi-branch)
- Choose date & time slot (based on availability)
- Book a service appointment
- View booking status: Pending → Confirmed → In Progress → Completed → Cancelled
- Cancel/reschedule booking (within allowed window)
- View service history per vehicle
- Make payment (online/pay-at-center) and download invoice
- Rate & review service after completion
- Receive notifications (email/SMS) for booking confirmation, reminders, status updates

### 2.2 Admin Module
- Admin login (separate role-based access)
- Manage service catalog (CRUD: name, description, price, duration)
- Manage time slots & daily capacity
- View/manage all bookings (approve, reject, reassign, cancel)
- Assign mechanic to a booking
- Manage mechanics/staff (CRUD)
- View customer & vehicle records
- Generate reports (revenue, bookings per day, popular services)
- Manage branches/service centers (if applicable)

### 2.3 Mechanic Module (optional but recommended)
- Login and view assigned jobs for the day
- Update job status (Started, In Progress, Completed)
- Add service notes / parts used

### 2.4 Common
- Authentication & Authorization (JWT-based, role-based access control)
- Notifications (email via SMTP, optional SMS via Twilio)
- Search & filter bookings/services
- Responsive UI (mobile + desktop)

---

## 3. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Booking API response < 500ms under normal load |
| **Scalability** | Should support multiple branches/service centers |
| **Security** | Passwords hashed (bcrypt), JWT auth, input validation, HTTPS |
| **Availability** | 99% uptime target for hosted deployment |
| **Usability** | Simple, mobile-responsive UI, minimal clicks to book |
| **Maintainability** | Modular codebase, documented REST APIs |
| **Data Integrity** | Prevent double-booking of same time slot |

---

## 4. System Flow (End-to-End)

### 4.1 Customer Booking Flow
```
1. Customer registers/logs in
2. Adds vehicle details (if not already added)
3. Browses available services -> selects service(s)
4. Selects branch (optional) -> selects date -> system shows available slots
5. Selects slot -> confirms booking details
6. (Optional) Makes payment / chooses pay-at-center
7. Booking created with status = PENDING
8. System sends confirmation email/SMS
9. Admin reviews -> CONFIRMED -> assigns mechanic
10. On service day: mechanic updates status -> IN_PROGRESS -> COMPLETED
11. Customer notified of completion -> invoice generated
12. Customer can rate/review the service
```

### 4.2 Admin Flow
```
1. Admin logs in to dashboard
2. Views all incoming bookings (filter by date/status/branch)
3. Confirms or rejects booking
4. Assigns mechanic & resources
5. Monitors job progress
6. Views reports/analytics
7. Manages service catalog, pricing, and slot capacity
```

### 4.3 State Diagram — Booking Status
```
PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
   |            |
   └──> CANCELLED <──┘
```

---

## 5. High-Level Architecture

```
                        ┌────────────────────────┐
                        │      Client (Browser)   │
                        │  React.js SPA (Frontend)│
                        └───────────┬─────────────┘
                                    │ REST API (HTTPS/JSON)
                                    ▼
                        ┌────────────────────────┐
                        │     API Gateway/Server  │
                        │  Node.js + Express.js   │
                        │  (Auth, Booking, Admin) │
                        └───────────┬─────────────┘
                    ┌───────────────┼───────────────────┐
                    ▼               ▼                    ▼
          ┌─────────────────┐ ┌────────────┐   ┌──────────────────┐
          │   MongoDB /      │ │ Notification│   │ Payment Gateway  │
          │   MySQL Database │ │ Service     │   │ (Razorpay/Stripe)│
          │   (Bookings,     │ │ (Email/SMS) │   │  (optional)      │
          │   Users, Vehicles│ └────────────┘   └──────────────────┘
          │   Services)      │
          └─────────────────┘
```

### 5.1 Suggested Tech Stack

| Layer | Technology (Recommended) | Alternatives |
|---|---|---|
| Frontend | React.js + Tailwind CSS / Bootstrap | Vue.js, Angular |
| State Management | Redux Toolkit / Context API | Zustand |
| Backend | Node.js + Express.js | Django, Spring Boot |
| Database | MongoDB (Mongoose) | MySQL/PostgreSQL |
| Auth | JWT + bcrypt | Firebase Auth |
| Notifications | Nodemailer (Email), Twilio (SMS) | SendGrid |
| Payment | Razorpay / Stripe | PayPal |
| Hosting (Frontend) | Vercel / Netlify | GitHub Pages |
| Hosting (Backend) | Render / Railway / AWS EC2 | Heroku |
| Database Hosting | MongoDB Atlas | PlanetScale (MySQL) |
| Version Control | Git + GitHub | GitLab |

---

## 6. Database Design (Schema)

### 6.1 Entity Relationship Overview
```
User (1) ────< (M) Vehicle
User (1) ────< (M) Booking
Vehicle (1) ──< (M) Booking
Service (1) ──< (M) BookingService (M) >── Booking
Booking (1) ──< (1) Payment
Booking (M) ──> (1) Mechanic
Booking (1) ──< (1) Review
```

### 6.2 Collections/Tables

**Users**
```
{
  _id, name, email, phone, passwordHash,
  role: "customer" | "admin" | "mechanic",
  createdAt
}
```

**Vehicles**
```
{
  _id, userId (ref: User), make, model, year,
  regNumber, fuelType, createdAt
}
```

**Services**
```
{
  _id, name, description, price, durationMinutes,
  category, isActive
}
```

**Bookings**
```
{
  _id, userId (ref: User), vehicleId (ref: Vehicle),
  serviceIds: [ref: Service],
  branchId (ref: Branch, optional),
  mechanicId (ref: User, optional),
  date, timeSlot,
  status: "PENDING"|"CONFIRMED"|"IN_PROGRESS"|"COMPLETED"|"CANCELLED",
  totalAmount, paymentStatus,
  notes, createdAt, updatedAt
}
```

**Payments**
```
{
  _id, bookingId (ref: Booking), amount,
  method: "online"|"cash", status: "paid"|"pending"|"failed",
  transactionId, paidAt
}
```

**Reviews**
```
{
  _id, bookingId (ref: Booking), userId (ref: User),
  rating (1-5), comment, createdAt
}
```

**Branches** (optional, for multi-center)
```
{
  _id, name, address, contactNumber, workingHours
}
```

**Slots** (availability management)
```
{
  _id, branchId, date, time, capacity, bookedCount
}
```

---

## 7. Backend Design

### 7.1 Folder Structure
```
server/
├── config/
│   ├── db.js
│   └── env.js
├── models/
│   ├── User.js
│   ├── Vehicle.js
│   ├── Service.js
│   ├── Booking.js
│   ├── Payment.js
│   └── Review.js
├── controllers/
│   ├── authController.js
│   ├── vehicleController.js
│   ├── serviceController.js
│   ├── bookingController.js
│   ├── adminController.js
│   └── paymentController.js
├── routes/
│   ├── authRoutes.js
│   ├── vehicleRoutes.js
│   ├── serviceRoutes.js
│   ├── bookingRoutes.js
│   ├── adminRoutes.js
│   └── paymentRoutes.js
├── middleware/
│   ├── authMiddleware.js   (JWT verify)
│   ├── roleMiddleware.js   (RBAC)
│   └── errorHandler.js
├── utils/
│   ├── sendEmail.js
│   ├── generateInvoice.js
│   └── validators.js
├── app.js
└── server.js
```

### 7.2 REST API Endpoints

**Auth**
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new customer |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/auth/me | Get current user profile |

**Vehicles**
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/vehicles | Add vehicle |
| GET | /api/vehicles | List user's vehicles |
| PUT | /api/vehicles/:id | Update vehicle |
| DELETE | /api/vehicles/:id | Delete vehicle |

**Services**
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/services | List all services |
| POST | /api/services | (Admin) Add service |
| PUT | /api/services/:id | (Admin) Update service |
| DELETE | /api/services/:id | (Admin) Remove service |

**Bookings**
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/bookings | Create booking |
| GET | /api/bookings/my | Get logged-in user's bookings |
| GET | /api/bookings/:id | Get booking detail |
| PUT | /api/bookings/:id/cancel | Cancel booking |
| GET | /api/bookings/slots?date= | Get available slots |

**Admin**
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/admin/bookings | View all bookings (filters) |
| PUT | /api/admin/bookings/:id/status | Update booking status |
| PUT | /api/admin/bookings/:id/assign | Assign mechanic |
| GET | /api/admin/reports | Revenue/analytics data |

**Payments**
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/payments/create | Create payment order |
| POST | /api/payments/verify | Verify payment |
| GET | /api/payments/:bookingId/invoice | Download invoice |

### 7.3 Authentication & Authorization
- JWT issued on login, stored client-side (httpOnly cookie recommended).
- Middleware `authMiddleware` verifies token on protected routes.
- `roleMiddleware(["admin"])` restricts admin-only routes.
- Passwords hashed with bcrypt (salt rounds ≥ 10).

---

## 8. Frontend Design

### 8.1 Folder Structure
```
client/
├── public/
├── src/
│   ├── api/
│   │   └── axiosInstance.js
│   ├── components/
│   │   ├── common/ (Navbar, Footer, Loader, ProtectedRoute)
│   │   ├── booking/ (BookingForm, SlotPicker, ServiceCard)
│   │   └── admin/ (BookingTable, ServiceForm, Sidebar)
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx (customer)
│   │   ├── MyVehicles.jsx
│   │   ├── BookService.jsx
│   │   ├── MyBookings.jsx
│   │   ├── BookingDetail.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── ManageServices.jsx
│   │       ├── ManageBookings.jsx
│   │       └── Reports.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── redux/ (if using Redux Toolkit)
│   │   ├── store.js
│   │   └── slices/
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── App.jsx
│   └── main.jsx
```

### 8.2 Key Pages / User Flow (Frontend)
1. **Home** — landing page with service highlights, CTA to book.
2. **Login/Register** — auth forms.
3. **Dashboard** — customer's vehicles, recent bookings, quick "Book Now".
4. **Book Service** — select vehicle → select service(s) → pick date/slot → confirm.
5. **My Bookings** — list with status badges, cancel/reschedule options.
6. **Booking Detail** — full info, invoice download, review form (after completion).
7. **Admin Dashboard** — stats cards (today's bookings, revenue), quick links.
8. **Manage Bookings (Admin)** — table with filters, status update, assign mechanic.
9. **Manage Services (Admin)** — CRUD table for service catalog.

### 8.3 Component Notes
- Use **ProtectedRoute** wrapper to guard customer/admin routes based on JWT + role.
- Use **Axios interceptor** to attach JWT token and handle 401 (auto-logout).
- Form validation with **React Hook Form + Yup**.
- Notifications/toasts via **react-toastify**.

---

## 9. Development Roadmap (Build Order)

| Phase | Tasks |
|---|---|
| **Phase 1 — Setup** | Init repo, set up Node/Express server, MongoDB connection, React app with Vite |
| **Phase 2 — Auth** | Register/Login APIs, JWT middleware, frontend auth pages, protected routes |
| **Phase 3 — Core Models** | Vehicle & Service CRUD (backend + frontend) |
| **Phase 4 — Booking Engine** | Slot availability logic, booking creation, booking list/detail pages |
| **Phase 5 — Admin Panel** | Admin auth/role check, booking management, service management, mechanic assignment |
| **Phase 6 — Notifications** | Email confirmation, status update emails |
| **Phase 7 — Payments** | Integrate Razorpay/Stripe test mode, invoice generation (PDF) |
| **Phase 8 — Reviews & Reports** | Review system, admin analytics/reports |
| **Phase 9 — Polish & Deploy** | Responsive UI pass, error handling, deploy frontend (Vercel) + backend (Render) + DB (Atlas) |

---

## 10. Deployment Architecture

```
GitHub Repo
   ├── client/ ──> Vercel (auto-deploy on push)
   └── server/ ──> Render/Railway (auto-deploy on push)
                        │
                        ▼
                 MongoDB Atlas (cloud DB)
```

- Use environment variables for secrets (`.env`): `JWT_SECRET`, `MONGO_URI`, `EMAIL_USER`, `EMAIL_PASS`, `RAZORPAY_KEY`.
- Enable CORS on backend for the deployed frontend domain.
- Use HTTPS on both ends (default on Vercel/Render).

---

## 11. Future Enhancements
- Live tracking of mechanic/vehicle status (WebSocket)
- Loyalty points/discount coupons
- Multi-branch inventory & spare parts tracking
- Push notifications (PWA)
- AI-based service recommendation based on vehicle age/mileage
