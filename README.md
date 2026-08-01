# FlavorsExpress — Single Restaurant Food Delivery System (FDS)

FlavorsExpress is a premium, full-stack Single Restaurant Food Delivery System. Built with **Spring Boot** on the backend and **React + Vite** on the frontend, it features a complete customer checkout journey, real-time dispatch control for administrators, automated/manual delivery partner assignment, dynamic promo discount codes, live ETAs, and a business performance analytics dashboard.

---

## 🚀 Key Features

### 🛒 Customer Portal
- **Browse & Filter Menu:** Search menu items by name or description. Filter by categories or Veg/Non-Veg flags with visual indicator badges.
- **Cart Management:** Add items to cart with live quantity controls and instant subtotal calculation.
- **Promo Codes & Discount Preview:** Input promo codes at checkout for a real-time discount preview, showing dollar savings and updated payable totals.
- **Order History & Live Status:** View previous orders with itemized lists, applied discount codes, and live ETAs (Estimated Time of Arrival) based on menu item preparation times.

### 🛡️ Admin Dashboard (Dispatch & Operations)
- **Business Performance Analytics:** Interactive KPI overview displaying total orders, lifetime revenue, today's order velocity, today's revenue, active delivery partners, order status distributions, and the top-selling menu items leaderboard.
- **Live Dispatch Control:** Monitor all placed orders, auto-assign delivery partners using a busy/available round-robin algorithm, or manually select a partner from the dropdown list. Update order progress status.
- **Promo Code Management:** Full CRUD interface for discounts. Define percentage rate, minimum order values, maximum caps, usage limits, and custom future expiration dates.
- **Menu & Category Controls:** Add, list, paginate, and remove menu items (including preparation time and vegetarian flags) or categories.

### 🚲 Delivery Partner View
- **Status Dashboard:** Delivery partners can set their status to Available/Busy/Offline.
- **Delivery Updates:** Accept orders, set status to `OUT_FOR_DELIVERY` or `DELIVERED`, which automatically releases the partner back into the available pool.

---

## 🛠️ Technology Stack

### Backend
- **Core Framework:** Spring Boot 3.5.4 (Java 21)
- **Database Access:** Spring Data JPA + Hibernate
- **Database Engine:** MySQL 8.x
- **Security & Identity:** Spring Security + JSON Web Tokens (JWT)
- **API Documentation:** OpenAPI 3 + Swagger UI (via `springdoc-openapi`)
- **JSON Utility & Validation:** Lombok, Jakarta Validation API

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Vanilla CSS + Tailwind-styled components for premium visual presentation
- **Icons:** Lucide React
- **HTTP Client:** Axios with JWT request interceptors

---

### Backend Properties (`src/main/resources/application.properties`)
```properties
# Database placeholders (parsed from environment)
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# Server configuration
server.port=${SERVER_PORT:8080}

# JWT signing parameters
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}

# CORS configuration
cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173,http://127.0.0.1:5173}
```

---

## 🔒 Environment Variables

FlavorsExpress uses environment variables for secure and decoupled configuration management.

### How to Create `.env` from `.env.example`

1. **Backend:**
   Copy `.env.example` in the root folder to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and fill in your local MySQL credentials under `DB_USERNAME` and `DB_PASSWORD`, along with a strong `JWT_SECRET`.

2. **Frontend:**
   Copy `frontend/.env.example` to `frontend/.env`:
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   Keep the default local configurations or adjust them if your ports differ.

---

### Variable Specifications

#### Backend Variables (Defined in `.env` at root)
| Variable | Description | Required / Optional | Default Value / Template |
| :--- | :--- | :--- | :--- |
| `DB_URL` | JDBC URL for MySQL connection | Optional | `jdbc:mysql://localhost:3306/...` |
| `DB_USERNAME` | Username for database access | **Required** | (User-defined, e.g., `root`) |
| `DB_PASSWORD` | Password for database access | **Required** | (User-defined, e.g., `Pratham`) |
| `SERVER_PORT` | Port the backend runs on | Optional | `8080` |
| `JWT_SECRET` | 512-bit Base64-encoded signing key | **Required** | (Generated Base64 string) |
| `JWT_EXPIRATION`| Token validity time in milliseconds | Optional | `86400000` (24 hours) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated CORS allowed origins | Optional | `http://localhost:5173,http://127.0.0.1:5173` |

#### Frontend Variables (Defined in `frontend/.env`)
| Variable | Description | Required / Optional | Default Value / Template |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of the backend REST API | **Required** | `http://localhost:8080/api` |
| `VITE_APP_NAME` | Display name of the application | Optional | `FlavorsExpress` |
| `VITE_GOOGLE_MAPS_API_KEY` | Key for Google Maps API | Optional | (Future placeholder) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary asset cloud name | Optional | (Future placeholder) |
| `VITE_FIREBASE_CONFIG` | Firebase SDK credentials configuration | Optional | (Future placeholder) |

---

### How Configs are Loaded

1. **Spring Boot (Backend):**
   - The application has been configured with standard dotenv support via Spring's native properties import mechanism:
     ```properties
     spring.config.import=optional:file:.env
     ```
     This tells Spring Boot to load the `.env` properties file from the root directory during boot.
   - Placeholders like `${DB_URL}` and `${DB_USERNAME}` are then resolved automatically.
   - Note: System environment variables (e.g. set via OS or Docker) take precedence over the `.env` file, facilitating seamless deployment to production/cloud containers.

2. **Vite + React (Frontend):**
   - Vite automatically loads variables prefixing with `VITE_` inside the `frontend/.env` file.
   - These variables are exposed in JavaScript code via the custom import metadata context:
     ```javascript
     import.meta.env.VITE_API_BASE_URL
     ```
   - Build assets read these values at compile-time when running `npm run dev` or `npm run build`.

---


## 🏁 How to Run

### 1. Database Setup
Ensure you have MySQL running locally. The database `food_delivery_db` will be created automatically if it doesn't exist. Update `spring.datasource.username` and `spring.datasource.password` in `application.properties` to match your credentials.

### 2. Run the Backend
From the root directory:
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```
The API server runs by default at [http://localhost:8080](http://localhost:8080).

### 3. Run the Frontend
From the `frontend` directory:
```bash
npm install
npm run dev
```
The dev server runs by default at [http://localhost:5173](http://localhost:5173).

---

## 📘 API Documentation (OpenAPI / Swagger)

Swagger UI is fully integrated and secured. To browse, test, and view API definitions, open:
- **Swagger UI Console:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI Json Docs:** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

> [!NOTE]
> Authorization headers must use the format `Bearer <token>` inside the Swagger Authorize modal to test role-secured endpoints (like Admin Analytics or Cart).

---

## 📂 Project Structure

```
FDS/
├── src/main/java/com/pratham/FDS/
│   ├── config/          # SecurityConfig, OpenApiConfig
│   ├── controller/      # API Rest Controllers (Menu, Orders, PromoCode, Analytics, Auth)
│   ├── dto/             # Data Transfer Objects & request payloads
│   ├── entity/          # JPA Entity definitions (Order, MenuItem, PromoCode, Customer, etc.)
│   ├── enums/           # OrderStatus, DeliveryPartnerStatus
│   ├── exception/       # GlobalExceptionHandler & ErrorDetails
│   ├── mapper/          # Manual mappers (MenuItemMapper, OrderMapper, PromoCodeMapper)
│   ├── repository/      # Spring Data JPA repositories
│   ├── security/        # JWT Filters & UserDetailsService
│   └── service/         # Business services interfaces & impls
└── frontend/
    ├── src/
    │   ├── api/         # Axios instance configurations
    │   ├── context/     # AuthContext, CartContext
    │   ├── pages/       # Menu, Checkout, Orders, AdminDashboard, Login, Register, Delivery
    │   └── App.jsx      # Navigation routing & global wrap
    └── package.json
```
