# School Tuckshop

Offline-first school tuckshop system for local Wi-Fi/LAN use.

It runs with a React frontend, an Express backend, local MongoDB, and local file uploads.

No internet services are required for normal school use.

---

## Main Features

- Student login works with an NFC card ID.
- Admin login works with email and password.
- Admin login can also work with an assigned NFC card.
- Super admins can create and manage users.
- Students can browse products and add items to cart.
- Students can pay from their NFC wallet balance.
- NFC checkout deducts balance, reduces stock, creates an order, and records a transaction.
- NFC checkout works on normal standalone local MongoDB.
- Admins can create products with local image uploads.
- Inventory tracks stock and low-stock levels.
- Wallet tools support top-up, deduction, and balance updates.
- Transaction pages show purchase and wallet history.
- Analytics pages summarize sales and activity.
- Local uploads are served from the `uploads/` folder.
- JWT sessions are stored in httpOnly cookies.
- Refresh tokens are stored in MongoDB.

---

## User Roles

### Student

Students sign in with their NFC card.

Students have wallet balances.

Students can buy products with their NFC card.

### Admin

Admins sign in with email and password.

Admins can also sign in with an assigned NFC card.

Admins can manage daily tuckshop operations.

### Super Admin

Super admins manage users, products, inventory, wallets, and reports.

Super admin accounts cannot be deleted from the dashboard.

---

## NFC Flow

A student account must have a unique NFC card ID.

An admin account can also have a unique NFC card ID.

NFC card IDs are trimmed before use.

This prevents scanner spaces or newlines from breaking login or payment.

For payment, the card must match the logged-in student account.

The app checks cart contents, stock, and wallet balance before checkout.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Zustand |
| Backend | Node.js, Express.js |
| Database | Local MongoDB |
| Auth | JWT cookies, bcrypt passwords |
| Uploads | Multer, local filesystem |
| Charts | Recharts |
| Icons | Lucide React |

---

## Requirements

- Node.js 18 or newer.
- MongoDB Community Server.
- A local `.env` file.

MongoDB should be running before the backend starts.

---

## Setup

Install root dependencies:

```powershell
npm install
```

Install frontend dependencies:

```powershell
npm install --prefix frontend
```

Create your environment file:

```powershell
copy .env.example .env
```

Seed the first super admin:

```powershell
npm run seed:admin
```

---

## Run In Development

Start the backend from the project root:

```powershell
npm run dev
```

Start the frontend from another terminal:

```powershell
npm run dev --prefix frontend
```

Open the app:

```text
http://localhost:5173
```

The backend uses the `PORT` value in `.env`.

The frontend proxy reads that backend port automatically.

---

## Run On A Local Network

Start the backend:

```powershell
npm run dev
```

Start the frontend for LAN access:

```powershell
npm run dev --prefix frontend -- --host 0.0.0.0
```

Open the app from another device:

```text
http://YOUR-COMPUTER-IP:5173
```

Example:

```text
http://192.168.1.23:5173
```

Windows Firewall may need to allow Node.js.

---

## Production Build

Build the frontend:

```powershell
npm run build
```

Start with PM2:

```powershell
pm2 start ecosystem.config.cjs
```

See `DEPLOYMENT.md` for Windows LAN deployment steps.

---

## Environment Variables

Copy `.env.example` to `.env`.

Common values:

```env
PORT=7000
HOST=0.0.0.0
NODE_ENV=production
MONGO_URI=mongodb://127.0.0.1:27017/tuckshop
ACCESS_TOKEN_SECRET=change_this_access_secret_local_only
REFRESH_TOKEN_SECRET=change_this_refresh_secret_local_only
CLIENT_URL=http://localhost:5173,http://192.168.1.10:5000
ALLOW_LAN=true
ADMIN_EMAIL=superadmin@school.local
ADMIN_PASSWORD=superadmin123456
ADMIN_NAME=Super Admin
```

Use strong JWT secrets on the real school server.

---

## Important API Routes

| Route | Purpose |
| --- | --- |
| `POST /api/auth/login` | Student NFC login |
| `POST /api/auth/login/admin` | Admin password login |
| `POST /api/auth/login/admin/card` | Admin NFC login |
| `POST /api/auth/logout` | Logout |
| `GET /api/auth/profile` | Current user profile |
| `POST /api/nfc/checkout` | NFC wallet checkout |
| `GET /api/products` | Product list |
| `POST /api/products` | Create product |
| `GET /api/cart` | Current student cart |
| `GET /api/users` | User management |
| `GET /api/wallet` | Wallet details |
| `GET /api/transactions` | Transaction records |
| `GET /uploads/products/*` | Product images |

---

## Project Structure

```text
backend/
  controllers/   Request handlers.
  models/        MongoDB models.
  routes/        API route definitions.
  middleware/    Auth and error middleware.
  services/      Wallet and audit logic.
  lib/           DB, roles, uploads, cache.
  scripts/       Admin seed script.
  server.js      Express app entry.

frontend/
  src/pages/     App pages.
  src/components/Reusable UI components.
  src/stores/    Zustand state stores.
  src/lib/       Axios and API helpers.

uploads/
  products/      Product image uploads.
```

---

## Notes

The app is designed for school LAN use.

Product images are stored locally.

Wallet payments do not use Stripe.

The app does not require Cloudinary, Redis, or MongoDB Atlas.

For best safety, back up MongoDB and the `uploads/` folder regularly.

---

## License

ISC
