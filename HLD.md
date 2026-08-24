# MediVerse – High-Level Design (HLD)

## 1. System Overview

MediVerse is a multi-portal healthcare web application with three user-facing portals — **Patient**, **Doctor**, and **Delivery Partner** — all powered by a shared RESTful backend and MongoDB database. The system is containerized using Docker and designed for cloud deployment.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (React + Vite)                │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Patient      │  │ Doctor       │  │ Delivery      │  │
│  │ Portal       │  │ Portal       │  │ Portal        │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
└─────────┼────────────────┼───────────────────┼──────────┘
          │                │                   │
          │        HTTPS / REST API             │
          ▼                ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                  SERVER (Express.js)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Auth    │ │ Doctor   │ │ Medicine │ │ Delivery  │  │
│  │  Module  │ │  Module  │ │  Module  │ │  Module   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  AI      │ │ Profile  │ │  Health  │ │  Order    │  │
│  │  Module  │ │  Module  │ │  Module  │ │  Module   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │
                    Mongoose ODM
                          │
                          ▼
              ┌──────────────────────┐
              │      MongoDB         │
              │  (Atlas / Local)     │
              └──────────────────────┘
                          │
              External Services
              ┌──────────────────────┐
              │  OpenAI API (AI Chat)│
              └──────────────────────┘
```

---

## 3. High-Level Components

### 3.1 Frontend (React SPA)

| Portal | Base Route | Description |
|--------|-----------|-------------|
| Patient Portal | `/dashboard/*` | Home, Doctors, Bookings, Medicines, Cart, Checkout, AI Check, Profile |
| Doctor Portal | `/doctor/*` | Dashboard, Appointments, Patients, Prescriptions, Revenue, Video Call |
| Delivery Portal | `/delivery/*` | Login, Register, Delivery Dashboard |

- **Framework:** React 19 with Vite bundler
- **Routing:** React Router v7 (nested routes with protected routes)
- **State Management:** React Context API (`AuthContext`, `CartContext`, `DoctorAuthContext`, `DeliveryAuthContext`)
- **Charts:** Recharts for analytics dashboards
- **PDF Export:** jsPDF + jsPDF-AutoTable for prescription generation
- **Styling:** CSS Modules (component-scoped styles)

---

### 3.2 Backend (Express REST API)

| Module | Base URL | Purpose |
|--------|---------|---------|
| Auth | `/api/auth` | Patient registration, login, JWT issuance |
| Doctors | `/api/doctors` | Browse doctors, get availability |
| Appointments | `/api/appointments` | Book, view, update appointments |
| Medicines | `/api/medicines` | Browse, search medicines |
| Cart | `/api/cart` | Add/remove/update cart items |
| Orders | `/api/orders` | Place and track orders |
| Health | `/api/health` | Health tips, health records |
| AI | `/api/ai` | AI symptom analysis via OpenAI |
| Profile | `/api/profile` | Profile updates, photo & report uploads |
| Doctor Auth | `/api/doctor` (auth) | Doctor registration and login |
| Doctor API | `/api/doctor` (api) | Appointments, patients, prescriptions, revenue |
| Delivery | `/api/delivery` | Delivery partner auth and order management |

---

### 3.3 Database (MongoDB)

**Collections:**

| Collection | Purpose |
|-----------|---------|
| `users` | Patient accounts and credentials |
| `doctors` | Doctor profiles and credentials |
| `appointments` | Appointment bookings |
| `doctoravailabilities` | Doctor time slot availability |
| `medicines` | Medicine catalog |
| `carts` | User cart items |
| `orders` | Medicine orders |
| `deliverypartners` | Delivery partner accounts |
| `prescriptions` | Doctor-issued prescriptions |
| `healthrecords` | Patient health data |
| `medicalhistories` | Patient medical history |
| `medicalreports` | Uploaded report files |
| `healthtips` | Health tips content |
| `chatsessions` | AI chat session data |
| `conversations` | AI conversation turns |
| `doctorchats` | Doctor-patient messaging |
| `doctorpatients` | Doctor-patient relationships |
| `doctorrevenues` | Doctor earnings records |
| `doctornotifications` | Notifications for doctors |

---

### 3.4 External Services

| Service | Purpose |
|---------|---------|
| OpenAI API | Powering the AI symptom checker (GPT model) |

---

## 4. Authentication Flow

```
Patient / Doctor / Delivery Partner
        │
        ▼
  POST /api/[auth]/login
        │
        ▼
  Validate credentials (bcrypt)
        │
        ▼
  Issue JWT Token
        │
        ▼
  Client stores token (localStorage)
        │
        ▼
  Subsequent requests include
  Authorization: Bearer <token>
        │
        ▼
  authMiddleware validates JWT
        │
        ▼
  Route handler executes
```

---

## 5. Data Flow – Medicine Order

```
User selects medicines → Adds to Cart
        │
        ▼
Cart API (/api/cart) stores items in DB
        │
        ▼
User proceeds to Checkout
        │
        ▼
Order API (/api/orders) creates Order document
        │
        ▼
Order assigned to Delivery Partner
        │
        ▼
Delivery Partner updates order status via /api/delivery
        │
        ▼
Patient sees order status on Order History page
```

---

## 6. Data Flow – Doctor Appointment

```
Patient browses Doctors → Selects doctor & slot
        │
        ▼
Appointment API (/api/appointments) creates booking
        │
        ▼
Doctor receives notification in Doctor Portal
        │
        ▼
Doctor accepts appointment via /api/doctor
        │
        ▼
Optional: Doctor initiates Video Call
        │
        ▼
Doctor issues Prescription → stored in DB
        │
        ▼
Patient views prescription in their Bookings
```

---

## 7. Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Docker Host                        │
│                                                      │
│  ┌─────────────────────┐  ┌──────────────────────┐  │
│  │  Frontend Container │  │  Backend Container   │  │
│  │  (Vite Build/Serve) │  │  (Node.js/Express)   │  │
│  └─────────────────────┘  └──────────────────────┘  │
│                                    │                  │
│                              MongoDB Atlas            │
│                            (External Cloud DB)        │
└──────────────────────────────────────────────────────┘
```

- In **production/docker** mode, Express serves the compiled React build from `public/dist`.
- The `Dockerfile` and `.dockerignore` are present at the project root for containerized deployment.

---

## 8. Security Considerations

| Concern | Mitigation |
|---------|-----------|
| Password storage | bcryptjs hashing (salt rounds) |
| API authorization | JWT tokens validated on every protected route |
| File uploads | Multer validates file types; stored in `public/uploads` |
| CORS | Configured in Express for allowed origins |
| Sensitive config | Stored in `.env` file, excluded from version control |

---

## 9. Scalability Considerations

- **Stateless Backend:** JWT-based auth allows horizontal scaling without session state.
- **Docker Containers:** Each service can be independently scaled.
- **MongoDB Atlas:** Managed cloud database with built-in replication and scaling.
- **Seeded Data:** Medicine catalog is seeded at startup if empty, preventing repeated data initialization.
