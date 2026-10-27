# KeepLoop 🔄
### Smart Personal Asset, Warranty & Maintenance Lifecycle Management System

[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT%20%26%20Bcrypt-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

**KeepLoop** is a full-stack web application engineered to catalog personal possessions, monitor warranty expirations in real time, record repair & maintenance logs with cost of ownership, and preserve comprehensive lifecycle histories from acquisition to retirement.

---

## 🌟 Key Features

- **🏠 Modern Landing Page:** Sleek overview of system capabilities, live database connectivity diagnostics, and value proposition.
- **🔐 Secure Authentication:** Single-tenant account isolation with salted `bcryptjs` password hashing and signed JSON Web Tokens (`JWT`).
- **📊 Real-Time Database Dashboard:**
  - Dynamic asset valuation sum.
  - Active warranty counts.
  - **Warranty Radar:** High-priority warnings for warranties expiring within 30 days.
  - Total maintenance expenditure & service counts.
  - Category distribution visualizer with relative percentage bars.
  - Chronological recent activity stream.
- **📦 Comprehensive Item Management:**
  - Record brand, model number, serial number (S/N), purchase date, store, location, and condition.
  - Multi-parameter filtering (by category, condition status, warranty status) and live search.
- **🛡️ Automated Warranty Expiry Calculation:**
  - Automatically computes precise expiration dates based on purchase date and warranty duration.
  - Real-time countdowns (`Active`, `Expiring Soon (≤30d)`, `Expired`).
  - Interactive coverage progress indicator bar.
- **🔧 Maintenance & Repair Tracking:**
  - Log repairs, preventive tune-ups, part swaps, battery replacements, and inspections.
  - Track total out-of-pocket costs and warranty coverage flags ($0 out-of-pocket).
- **⏳ Item Lifecycle Timeline:**
  - Auto-generated historical milestones: *Purchased* → *Warranty Registered* → *Maintenance Performed* → *Status Changed (In Repair / Storage / Sold / Donated / Recycled)*.
  - Add custom notes and historical milestones anytime.
- **👤 Profile & Settings:**
  - Update user name, biography, and preferred currency (`USD`, `EUR`, `GBP`, `INR`, `CAD`, `AUD`, `JPY`).
  - Secure in-app password changes.
- **☁️ Dual Database Support:**
  - Works out of the box with **Local MongoDB** (`mongodb://localhost:27017/keeploop`).
  - Seamlessly connects to **MongoDB Atlas Cloud Clusters** for zero-install cloud portability.
  - Built-in diagnostic endpoint (`GET /api/health`) with live in-app connection tester.

---

## 🏗️ Project Architecture

```text
d:\NF\
├── package.json              # Orchestrates client & server concurrent execution
├── README.md                 # Full project documentation & guide
├── .gitignore                # Protects credentials (.env) & dependencies
│
├── server/                   # Backend Node.js + Express API
│   ├── .env.example          # Environment variable template
│   ├── .env                  # Environment config (ignored in Git)
│   ├── package.json          # Express, Mongoose, JWT, bcryptjs, cors, morgan
│   ├── index.js              # Server entry point & health check route
│   ├── config/
│   │   └── db.js             # Mongoose connection & DB diagnostics
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication & route protector
│   │   └── errorHandler.js   # Centralized error handler
│   ├── models/
│   │   ├── User.js           # User schema with bcrypt password hashing
│   │   ├── Item.js           # Item schema with warranty virtuals & calculations
│   │   ├── Maintenance.js    # Service record schema
│   │   └── LifecycleEvent.js # Historical milestones & timeline schema
│   └── routes/
│       ├── auth.js           # Authentication, profile, password management
│       ├── items.js          # Item CRUD with automatic lifecycle logging
│       ├── maintenance.js    # Repair & maintenance CRUD
│       ├── lifecycle.js      # Milestone event feeds
│       └── dashboard.js      # Real-time database aggregations
│
└── client/                   # Frontend React + Vite SPA
    ├── package.json          # React 18, React Router DOM, Lucide Icons
    ├── vite.config.js        # Vite config with API proxy to port 5000
    ├── index.html            # Web app entry with Google Fonts
    └── src/
        ├── App.jsx           # App layout & route definitions
        ├── index.css         # Pure CSS Design System & responsive styling
        ├── services/api.js   # Fetch API wrapper with JWT interceptor
        ├── context/
        │   └── AuthContext.jsx # Global auth state & live DB health probe
        ├── components/
        │   ├── Navbar.jsx    # Sticky navigation with live DB status pill
        │   ├── Footer.jsx    # Application footer
        │   ├── ProtectedRoute.jsx # Authentication guard
        │   ├── StatusBadge.jsx    # Visual item status pill badges
        │   ├── WarrantyBadge.jsx  # Active / Expiring / Expired badge
        │   ├── LoadingSpinner.jsx # Smooth loading states
        │   ├── EmptyState.jsx     # Informative empty states
        │   ├── ErrorAlert.jsx     # Dismissible error banners
        │   └── Modal.jsx          # Accessible modal dialogs
        └── pages/
            ├── LandingPage.jsx     # Value proposition & live status
            ├── LoginPage.jsx       # User login
            ├── RegisterPage.jsx    # User signup with currency selector
            ├── DashboardPage.jsx   # Aggregated analytics & warranty radar
            ├── ItemsPage.jsx       # Inventory grid with search & filters
            ├── ItemDetailPage.jsx  # Item specs, warranty bar, repairs & timeline
            ├── ItemFormPage.jsx    # Add / Edit with auto-expiry calculation
            ├── MaintenancePage.jsx # Comprehensive repair log & spend tracker
            ├── ProfilePage.jsx     # User settings & password change
            ├── AtlasGuidePage.jsx  # Interactive in-app database guide
            └── NotFoundPage.jsx    # 404 page
```

---

## 🔌 Database Setup (Local & Cloud Atlas)

### Option 1: Local MongoDB (Default)
If you have MongoDB Community Server running locally:
1. Ensure the MongoDB service is running on port `27017`.
2. In `server/.env`, set:
   ```env
   MONGODB_URI=mongodb://localhost:27017/keeploop
   ```

### Option 2: MongoDB Atlas (Cloud Database)
If you prefer cloud storage without running a local MongoDB service:
1. Sign up for a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create an **M0 (Free Forever)** cluster.
3. In **Database Access**, create a user with a secure password.
   > ⚠️ **URL-Encoding Note:** If your password contains special characters (`@`, `#`, `$`, `%`, etc.), URL-encode them (e.g. `@` → `%40`, `#` → `%23`).
4. In **Network Access**, add `0.0.0.0/0` (Allow Access from Anywhere).
5. Copy your connection string from **Connect → Drivers (Node.js)** and place it in `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/keeploop?retryWrites=true&w=majority
   ```

---

## ⚙️ Environment Configuration

Copy the template from `server/.env.example` to `server/.env`:

```env
PORT=5000
NODE_ENV=development

# MongoDB Connection String (Local or Atlas Cloud)
MONGODB_URI=mongodb://localhost:27017/keeploop

# JWT Configuration
JWT_SECRET=keeploop_super_secret_jwt_key_2026
JWT_EXPIRE=7d

# Allowed Frontend Origin
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Getting Started

### 1. Installation
Install all root, backend, and frontend dependencies:
```bash
npm run install:all
```

### 2. Run the Full Stack
Start both the Express backend (`http://localhost:5000`) and the Vite React frontend (`http://localhost:5173`) with a single command:
```bash
npm run dev
```

### 3. Alternative: Run in Separate Terminals
- **Backend API:**
  ```bash
  npm run server
  ```
- **Frontend App:**
  ```bash
  npm run client
  ```

Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## 📡 API Endpoints Reference

### Health & Diagnostics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns server health, timestamp, and database connection status |

### Authentication & Profile (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Protected | Get current user profile |
| `PUT` | `/api/auth/profile` | Protected | Update profile (name, bio, currency) |
| `PUT` | `/api/auth/password` | Protected | Change account password |

### Possessions & Items (`/api/items`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/items` | Protected | List items with search, category, status & sort filters |
| `POST` | `/api/items` | Protected | Create item (auto-logs purchase milestone & warranty) |
| `GET` | `/api/items/:id` | Protected | Get item details with warranty calculations |
| `PUT` | `/api/items/:id` | Protected | Update item (auto-logs status/location changes) |
| `DELETE` | `/api/items/:id` | Protected | Delete item and cascade-delete linked maintenance & lifecycle |

### Maintenance & Repairs (`/api/maintenance`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/maintenance` | Protected | Get all service records (filter by item or service type) |
| `POST` | `/api/maintenance` | Protected | Log new service record (auto-logs milestone) |
| `PUT` | `/api/maintenance/:id` | Protected | Update maintenance record |
| `DELETE` | `/api/maintenance/:id` | Protected | Delete maintenance record |

### Lifecycle & Milestones (`/api/lifecycle`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/lifecycle/item/:itemId` | Protected | Get complete chronological timeline for an item |
| `GET` | `/api/lifecycle/recent` | Protected | Get recent milestone activity feed across all items |
| `POST` | `/api/lifecycle` | Protected | Add custom milestone or note to an item |

### Dashboard Aggregations (`/api/dashboard`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Protected | Aggregate total values, active warranties, radar alerts, spend |

---

## 🔒 Security Best Practices

- **Never Commit `.env`:** The `.gitignore` is pre-configured to strictly ignore all `.env` files.
- **Client Security:** Frontend code communicates exclusively via REST API and never exposes database credentials or JWT signing secrets.
- **Password Protection:** All user passwords are encrypted using `bcryptjs` with auto-generated salt rounds before storage.
- **Data Isolation:** All database queries are scoped to `req.user._id`, ensuring users can only read, update, or delete their own data.

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).
