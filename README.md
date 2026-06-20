# B2B Sourcing and Logistics Portal

An enterprise-grade, full-stack B2B Sourcing and Logistics platform designed to streamline international import operations. This repository structure contains both the Next.js frontend and Express.js backend as a unified workspace.

---

## About the Project

This platform (codenamed **Elios**) acts as an end-to-end bridge between B2B buyers (clients), sourcing agents, warehouse operators, and suppliers. It automates the complex lifecycle of importing goods—from initial RFQs (Requests for Quotations) and itemized negotiations to payment verification, multi-stage quality control checks, warehousing, packaging validation, and final shipment tracking.

### Core Architecture Highlights (For Developers)
* **Monorepo Workspace**: Separated into frontend (`/frontend`) and backend (`/server`) for clean separation of concerns and independent deployment options.
* **Type-Safe Ecosystem**: Built end-to-end with **TypeScript** across both Next.js and Express to enforce type boundaries and contract safety.
* **Secure Database Layer**: Powered by **PostgreSQL** and managed using **Prisma ORM**, incorporating connection pooling and automated migration logging.
* **Production-Hardened API**: Implements layered security including security headers (`helmet`), HTTP parameter pollution protection (`hpp`), input sanitization (dropping MongoDB-style operator injections), and multi-tier rate limiting (general, auth, and search-heavy endpoints).
* **JWT Session Management**: Incorporates cryptographic Access tokens (short-lived) and Database-backed Refresh tokens (long-lived) to enable complete remote session revocation.

### High-Impact Value (For Recruiters)
* **Real-World Complexity**: Unlike trivial CRUD projects, this system addresses real-world business logic such as currency conversion (CNY to INR), multi-role validation, bulk image upload handling, and multi-stage workflow transitions.
* **Full-Stack Competency**: Demonstrates clean directory structuring, API routing, custom middleware composition, responsive dashboard layouts, and transaction safety.

---

## System Architecture & Process Pipeline

The platform orchestrates a multi-role pipeline involving **Clients**, **Admins**, **Sourcing Agents**, and **Warehouse Staff**:

```mermaid
graph TD
    A[Client: Creates Sourcing Request] --> B[Admin: Submits Quotation in CNY]
    B --> C[Client: Approves / Counters Items in INR]
    C --> D[Client: Submits Payment Proof]
    D --> E[Admin: Verifies Payment Receipt]
    E --> F[System: Auto-Generates Order & Stages]
    F --> G[Warehouse: Performs Quality Control Check]
    G --> H[Warehouse: Logs Repack Report & Uploads Photos]
    H --> I[Client: Approves Repack or Flags Concerns]
    I --> J[Admin/Staff: Enters Logistics & Carrier Details]
    J --> K[Client: Tracks Shipment to Final Delivery]
```

### Process Breakdown:
1. **Sourcing Request & RFQ**: Clients request catalog or custom goods by submitting references (descriptions, target prices, images).
2. **Item-by-Item Negotiation**: Admins source the goods and enter pricing in CNY. The backend automatically translates this to INR. The client can accept, reject, or suggest counter-prices for individual items.
3. **Payment Gate & Conversion**: When negotiations settle, the client uploads payment proof. Admins verify the proof, and the platform transitions the request into an active **Order** with an 11-step pipeline.
4. **Quality Control (QC)**: Sourcing agents inspect items at the warehouse, tagging them as `QC_PASSED` or `QC_FAILED` with image logs.
5. **Repacking & Customer Approval**: Warehouse staff repack the items, log final weight/volume, and upload packaging photos. The client must digitally sign off on the packaging before dispatch.
6. **Logistics & Shipment**: Staff update shipment tracking (carrier, tracking numbers, customs status) until the package is delivered.

---

## Key Use Cases

* **Custom Product Sourcing**: B2B clients can import non-catalog products by supplying references and images, initiating a manual quoting workflow.
* **Interactive Negotiation**: Direct messaging/chat linked to each sourcing request allows real-time alignment between buyers and sourcing agents.
* **Digital Escrow / Payment Verification**: Minimizes financial risk by requiring proof upload and staff double-checks for all deposits and balance payments.
* **Visual Repack Validation**: Prevents international shipping errors by letting clients view their actual package contents, weight, and volume before the container leaves the warehouse.

---

## Technology Stack

### Frontend (`/frontend`)
* **Core**: Next.js 15 (App Router), React 19, TypeScript
* **Styling**: Tailwind CSS, PostCSS
* **State & Data Fetching**: React Hooks, Fetch API with Edge Middleware auth validation

### Backend (`/server`)
* **Runtime**: Node.js, Express.js, TypeScript
* **Database & ORM**: PostgreSQL, Prisma ORM
* **Libraries**: Zod (schema validation), JSONWebToken (JWT auth), BcryptJS (password hashing), Nodemailer (email notifications), Multer (image uploads)

---

## Local Setup & Installation

### Prerequisites
* Node.js (v18.x or newer recommended)
* PostgreSQL database instance
* Git

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/just-hacked/B2b-logistic-portal.git
cd B2b-logistic-portal
```

---

### Step 2: Backend Setup (`/server`)

1. **Navigate to the server folder**:
   ```bash
   cd server
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file based on `.env.example`:
   ```env
   PORT=4000
   DATABASE_URL="postgresql://user:password@localhost:5432/db_name?schema=public"
   JWT_SECRET="your-jwt-secret-key"
   JWT_ACCESS_SECRET="your-jwt-access-secret-key"
   JWT_REFRESH_SECRET="your-jwt-refresh-secret-key"
   CLIENT_URL="http://localhost:3000"
   ```
4. **Run Prisma Migrations & Seed**:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
5. **Start Backend in Development Mode**:
   ```bash
   npm run dev
   ```

---

### Step 3: Frontend Setup (`/frontend`)

1. **Navigate to the frontend folder**:
   ```bash
   cd ../frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
   JWT_ACCESS_SECRET="your-jwt-access-secret-key" # Must match backend
   ```
4. **Start Frontend in Development Mode**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

---

## Security and Production Standards Implemented

* **Input Sanitization**: Rejects any request body or query param that contains keys starting with `$` or containing `.` to prevent NoSQL operator injection and path traversal issues.
* **Zod Schema Validation**: Validates all incoming payloads before they touch the controller/service layer, sending clean `422 Unprocessable Entity` responses on schema mismatch.
* **Database Constraints**: Restricts cascading deletes on critical payment and order tables to maintain consistent financial ledgers.
* **Error Handling**: A centralized global error handler catches all asynchronous failures, maps database exceptions to correct HTTP statuses (e.g., duplicate errors to `409 Conflict`), and keeps stack traces hidden in production environment.
