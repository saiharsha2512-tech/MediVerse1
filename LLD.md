# MediVerse – Low-Level Design (LLD)

## 1. Introduction

This document provides the detailed low-level design of the MediVerse platform, covering database schemas, API endpoint specifications, component structure, middleware, and key implementation patterns.

---

## 2. Database Schema (Mongoose Models)

### 2.1 User (Patient)

**File:** `server/models/User.js`

```
User {
  name          : String (required)
  email         : String (required, unique)
  mobile        : String
  password      : String (required, bcrypt hashed)
  profilePic    : String (path to uploaded image)
  role          : String (default: 'patient')
  bloodGroup    : String
  dateOfBirth   : Date
  address       : String
  createdAt     : Date (auto)
  updatedAt     : Date (auto)
}
```

---

### 2.2 Doctor

**File:** `server/models/Doctor.js`

```
Doctor {
  name          : String (required)
  email         : String (required, unique)
  password      : String (required, bcrypt hashed)
  specialty     : String (required)
  degree        : String
  experience    : Number (years)
  fee           : Number (consultation fee)
  profilePic    : String
  about         : String
  rating        : Number (default: 0)
  isVerified    : Boolean (default: false)
  createdAt     : Date (auto)
}
```

---

### 2.3 Appointment

**File:** `server/models/Appointment.js`

```
Appointment {
  patient       : ObjectId → User
  doctor        : ObjectId → Doctor
  date          : Date (required)
  timeSlot      : String (required)
  status        : String ['pending', 'confirmed', 'completed', 'cancelled']
  symptoms      : String
  notes         : String
  createdAt     : Date (auto)
}
```

---

### 2.4 DoctorAvailability

**File:** `server/models/DoctorAvailability.js`

```
DoctorAvailability {
  doctor        : ObjectId → Doctor
  date          : Date
  slots         : [String] (array of available time slots)
}
```

---

### 2.5 Medicine

**File:** `server/models/Medicine.js`

```
Medicine {
  name          : String (required)
  category      : String
  price         : Number
  description   : String
  image         : String
  stock         : Number (default: 100)
  manufacturer  : String
  dosage        : String
}
```

---

### 2.6 Cart

**File:** `server/models/Cart.js`

```
Cart {
  user          : ObjectId → User (unique)
  items         : [
    {
      medicine  : ObjectId → Medicine
      quantity  : Number (default: 1)
    }
  ]
  updatedAt     : Date (auto)
}
```

---

### 2.7 Order

**File:** `server/models/Order.js`

```
Order {
  user          : ObjectId → User
  items         : [
    {
      medicine  : ObjectId → Medicine
      quantity  : Number
      price     : Number
    }
  ]
  totalAmount   : Number
  deliveryAddress : String
  status        : String ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled']
  deliveryPartner : ObjectId → DeliveryPartner
  createdAt     : Date (auto)
}
```

---

### 2.8 DeliveryPartner

**File:** `server/models/DeliveryPartner.js`

```
DeliveryPartner {
  name          : String (required)
  email         : String (required, unique)
  mobile        : String
  password      : String (bcrypt hashed)
  vehicleType   : String
  isAvailable   : Boolean (default: true)
  currentOrders : [ObjectId → Order]
  createdAt     : Date (auto)
}
```

---

### 2.9 DoctorPrescription

**File:** `server/models/DoctorPrescription.js`

```
DoctorPrescription {
  doctor        : ObjectId → Doctor
  patient       : ObjectId → User
  appointment   : ObjectId → Appointment
  medicines     : [
    {
      name      : String
      dosage    : String
      duration  : String
      instructions : String
    }
  ]
  notes         : String
  createdAt     : Date (auto)
}
```

---

### 2.10 HealthRecord

**File:** `server/models/HealthRecord.js`

```
HealthRecord {
  user          : ObjectId → User
  bloodPressure : String
  bloodSugar    : String
  weight        : Number
  height        : Number
  date          : Date (auto)
}
```

---

### 2.11 MedicalReport

**File:** `server/models/MedicalReport.js`

```
MedicalReport {
  user          : ObjectId → User
  title         : String
  filePath      : String (path to uploaded file)
  uploadedAt    : Date (auto)
}
```

---

### 2.12 ChatSession / Conversation (AI)

**File:** `server/models/ChatSession.js`, `server/models/Conversation.js`

```
ChatSession {
  user          : ObjectId → User
  createdAt     : Date (auto)
}

Conversation {
  session       : ObjectId → ChatSession
  role          : String ['user', 'assistant']
  content       : String
  createdAt     : Date (auto)
}
```

---

### 2.13 DoctorRevenue

**File:** `server/models/DoctorRevenue.js`

```
DoctorRevenue {
  doctor        : ObjectId → Doctor
  appointment   : ObjectId → Appointment
  patient       : ObjectId → User
  amount        : Number
  date          : Date (auto)
  status        : String ['pending', 'paid']
}
```

---

## 3. API Endpoints

### 3.1 Patient Auth (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|:---:|
| POST | `/api/auth/register` | Register a new patient | No |
| POST | `/api/auth/login` | Login and receive JWT | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

---

### 3.2 Doctors (`/api/doctors`)

| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|:---:|
| GET | `/api/doctors` | Get all doctors | Yes |
| GET | `/api/doctors/:id` | Get doctor by ID | Yes |
| GET | `/api/doctors/:id/availability` | Get doctor's available slots | Yes |

---

### 3.3 Appointments (`/api/appointments`)

| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|:---:|
| POST | `/api/appointments` | Book an appointment | Yes |
| GET | `/api/appointments/my` | Get current user's appointments | Yes |
| PUT | `/api/appointments/:id` | Update appointment | Yes |
| DELETE | `/api/appointments/:id` | Cancel appointment | Yes |

---

### 3.4 Medicines (`/api/medicines`)

| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|:---:|
| GET | `/api/medicines` | Get all medicines (with search/filter) | Yes |
| GET | `/api/medicines/:id` | Get medicine by ID | Yes |

---

### 3.5 Cart (`/api/cart`)

| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|:---:|
| GET | `/api/cart` | Get current user's cart | Yes |
| POST | `/api/cart/add` | Add item to cart | Yes |
| PUT | `/api/cart/update` | Update item quantity | Yes |
| DELETE | `/api/cart/remove/:medicineId` | Remove item from cart | Yes |
| DELETE | `/api/cart/clear` | Clear entire cart | Yes |

---

### 3.6 Orders (`/api/orders`)

| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|:---:|
| POST | `/api/orders` | Place a new order | Yes |
| GET | `/api/orders/my` | Get user's order history | Yes |
| GET | `/api/orders/:id` | Get order details | Yes |

---

### 3.7 AI Chat (`/api/ai`)

| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|:---:|
| POST | `/api/ai/chat` | Send message, receive AI response | Yes |
| GET | `/api/ai/history` | Get AI chat history | Yes |

---

### 3.8 Profile (`/api/profile`)

| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|:---:|
| PUT | `/api/profile/update` | Update user profile info | Yes |
| POST | `/api/profile/upload-pic` | Upload profile picture | Yes |
| POST | `/api/profile/upload-report` | Upload medical report | Yes |
| GET | `/api/profile/reports` | Get all medical reports | Yes |

---

### 3.9 Doctor Auth (`/api/doctor`)

| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|:---:|
| POST | `/api/doctor/register` | Register a doctor | No |
| POST | `/api/doctor/login` | Doctor login | No |

---

### 3.10 Doctor API (`/api/doctor`)

| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|:---:|
| GET | `/api/doctor/appointments` | Get doctor's appointments | Doctor |
| PUT | `/api/doctor/appointments/:id` | Accept/reject/update appointment | Doctor |
| GET | `/api/doctor/patients` | Get doctor's patient list | Doctor |
| POST | `/api/doctor/prescriptions` | Create prescription | Doctor |
| GET | `/api/doctor/revenue` | Get revenue summary | Doctor |
| GET | `/api/doctor/dashboard` | Dashboard stats | Doctor |

---

### 3.11 Delivery (`/api/delivery`)

| Method | Endpoint | Description | Auth Required |
|--------|---------|-------------|:---:|
| POST | `/api/delivery/register` | Register delivery partner | No |
| POST | `/api/delivery/login` | Delivery partner login | No |
| GET | `/api/delivery/orders` | Get assigned orders | Delivery |
| PUT | `/api/delivery/orders/:id/status` | Update delivery status | Delivery |

---

## 4. Middleware

### 4.1 Auth Middleware (`server/middleware/`)

```javascript
// authMiddleware.js
// - Reads Authorization: Bearer <token> header
// - Verifies JWT using secret key
// - Attaches decoded user to req.user
// - Calls next() on success, returns 401 on failure
```

**Usage:** Applied to all protected routes via:
```javascript
router.get('/profile', authMiddleware, profileController.getProfile);
```

### 4.2 File Upload Middleware (Multer)

```javascript
// Configured with:
// - dest: 'public/uploads/'
// - File size limits
// - File type validation (images: jpeg/png, reports: pdf/jpeg/png)
```

---

## 5. Frontend Component Structure

```
client/src/
├── App.jsx                        # Root app with all route definitions
├── context/
│   ├── AuthContext.jsx            # Patient auth state (login/logout/user)
│   ├── CartContext.jsx            # Cart item state (add/remove/update)
│   ├── doctor/
│   │   └── DoctorAuthContext.jsx  # Doctor auth state
│   └── delivery/
│       └── DeliveryAuthContext.jsx # Delivery partner auth state
├── components/
│   ├── Login.jsx                  # Patient login form
│   ├── Register.jsx               # Patient registration form
│   ├── PrivateRoute.jsx           # Guards patient dashboard routes
│   ├── dashboard/                 # Patient dashboard components
│   │   ├── Layout.jsx             # Dashboard shell with BottomNav
│   │   ├── BottomNav.jsx          # Mobile navigation bar
│   │   ├── Home.jsx               # Patient home/dashboard
│   │   ├── Doctors.jsx            # Doctor listing & booking
│   │   ├── Bookings.jsx           # Appointment history
│   │   ├── Medicines.jsx          # Medicine catalog
│   │   ├── MedicineCard.jsx       # Individual medicine card
│   │   ├── Cart.jsx               # Shopping cart
│   │   ├── Checkout.jsx           # Order checkout form
│   │   ├── OrderSuccess.jsx       # Order success screen
│   │   ├── AICheck.jsx            # AI symptom checker chat
│   │   └── Profile.jsx            # User profile management
│   ├── doctor/
│   │   ├── DoctorLayout.jsx       # Doctor portal shell
│   │   └── DoctorProtectedRoute.jsx
│   └── delivery/
│       └── DeliveryProtectedRoute.jsx
├── pages/
│   ├── doctor/
│   │   ├── Login.jsx              # Doctor login page
│   │   ├── Register.jsx           # Doctor register page
│   │   ├── Dashboard.jsx          # Doctor dashboard with stats
│   │   ├── Appointments.jsx       # Appointment list & management
│   │   ├── AppointmentDetail.jsx  # Single appointment detail
│   │   ├── Patients.jsx           # Patient management
│   │   ├── Prescriptions.jsx      # Prescription creation
│   │   ├── Profile.jsx            # Doctor profile management
│   │   ├── Settings.jsx           # Doctor settings
│   │   ├── Revenue.jsx            # Revenue analytics
│   │   └── VideoCall.jsx          # Video call interface
│   └── delivery/
│       ├── DeliveryLogin.jsx
│       ├── DeliveryRegister.jsx
│       └── DeliveryDashboard.jsx
└── services/
    └── (API service modules for axios calls)
```

---

## 6. Backend Directory Structure

```
server/
├── server.js                      # App entry point, route registration
├── config/
│   └── db.js                      # MongoDB connection via Mongoose
├── models/                        # Mongoose schemas (see Section 2)
├── routes/
│   ├── authRoutes.js
│   ├── doctorRoutes.js
│   ├── appointmentRoutes.js
│   ├── medicineRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   ├── healthRoutes.js
│   ├── aiRoutes.js
│   ├── profileRoutes.js
│   ├── doctor/
│   │   ├── authRoutes.js
│   │   └── apiRoutes.js
│   └── delivery/
│       └── deliveryRoutes.js
├── controllers/                   # Business logic for each route module
├── middleware/                    # JWT auth, multer file upload middleware
├── services/                      # External service integrations (OpenAI)
├── public/
│   ├── uploads/                   # Uploaded files (profile pics, reports)
│   └── dist/                      # Compiled React build (production)
└── seedMedicines.js               # Medicine catalog seeder script
```

---

## 7. Key Implementation Patterns

### 7.1 JWT Authentication Flow

```
1. Login request → validate credentials
2. Generate token: jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
3. Client stores token in localStorage
4. All API requests send: headers: { Authorization: `Bearer ${token}` }
5. Middleware: jwt.verify(token, JWT_SECRET) → attach decoded to req.user
```

### 7.2 Context-based State Management

Each portal has its own React Context to avoid cross-portal state pollution:

```javascript
// Example: AuthContext
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const login = (userData, token) => { /* store token, set user */ };
  const logout = () => { /* clear token, reset user */ };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
```

### 7.3 Protected Routes

```javascript
// PrivateRoute.jsx
const PrivateRoute = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/" />;
};
```

### 7.4 File Upload Pattern

```javascript
// Server: multer middleware
const upload = multer({ dest: 'public/uploads/' });
router.post('/upload-pic', authMiddleware, upload.single('profilePic'), controller.uploadPic);

// Client: FormData for multipart upload
const formData = new FormData();
formData.append('profilePic', file);
await axios.post('/api/profile/upload-pic', formData, {
  headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
});
```

### 7.5 AI Chat Integration (OpenAI)

```javascript
// services/openaiService.js
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const getAIResponse = async (messages) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a helpful medical assistant...' },
      ...messages
    ]
  });
  return response.choices[0].message.content;
};
```

---

## 8. Error Handling Strategy

| Layer | Handling |
|-------|---------|
| Mongoose Validation | Schema-level validation errors returned as 400 |
| Auth Errors | 401 Unauthorized with descriptive message |
| Not Found | 404 with resource name |
| Server Errors | 500 with generic message (details logged server-side) |
| Frontend | `react-hot-toast` for user-facing error/success notifications |

---

## 9. Environment Configuration

**File:** `server/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mediverse
JWT_SECRET=<your_secret_key>
OPENAI_API_KEY=<your_openai_key>
NODE_ENV=development
```

---

## 10. Docker Configuration

**File:** `Dockerfile` (project root)

- Base: Node.js LTS image
- Copies server and built client files
- Installs server dependencies
- Sets `NODE_ENV=docker` to trigger static file serving
- Exposes port 5000
- Entry point: `node server/server.js`
