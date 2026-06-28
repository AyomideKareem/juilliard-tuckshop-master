# Local Deployment Guide — School Tuckshop (Offline LAN)

This guide covers deploying the tuckshop entirely on a **local school network** with **no internet dependency**.

---

## Architecture

```
[School Router / Wi-Fi]
         |
    Ethernet
         |
   [Server PC]  ← MongoDB + Node.js + uploads folder
         |
   Wi-Fi clients (students, staff phones/tablets)
```

All traffic stays on the LAN. Example access URL:

`http://192.168.1.10:5000`

---

## 1. Server PC Requirements

- Windows 10/11 PC connected to router via **Ethernet**
- Static local IP (recommended): e.g. `192.168.1.10`
- Node.js 18+ LTS
- MongoDB Community Server 7.x
- PM2 (optional, recommended for production)

---

## 2. Install MongoDB Community (Local)

1. Download MongoDB Community Server from mongodb.com (install on the server PC once; no Atlas account needed).
2. Install as a Windows Service (default option).
3. Verify:

```powershell
mongosh
# Should connect to mongodb://127.0.0.1:27017
```

Default connection string:

```
mongodb://127.0.0.1:27017/tuckshop
```

---

## 3. Set Static IP on Server (Windows)

1. Open **Settings → Network → Ethernet → IP assignment → Edit**
2. Set **Manual**:
   - IP: `192.168.1.10`
   - Subnet: `255.255.255.0`
   - Gateway: your router IP (e.g. `192.168.1.1`)
   - DNS: can leave blank for offline use, or use router IP

Students connect to the tuckshop using this IP.

---

## 4. Application Setup

```powershell
cd C:\path\to\j-commerce-tuckshop
copy .env.example .env
# Edit .env — set JWT secrets and CLIENT_URL with your server IP

npm install
npm run build
npm run seed:admin
```

### Key `.env` values

```env
PORT=5000
HOST=0.0.0.0
MONGO_URI=mongodb://127.0.0.1:27017/tuckshop
CLIENT_URL=http://192.168.1.10:5000,http://localhost:5173
ALLOW_LAN=true
NODE_ENV=production
```

---

## 5. Image Storage (Local — No Cloudinary)

Product images are stored at:

```
uploads/products/
```

Served statically at:

```
http://192.168.1.10:5000/uploads/products/<filename>.jpg
```

The `uploads/` folder is created automatically on first run.

---

## 6. Run with PM2 (Production)

```powershell
npm install -g pm2
mkdir logs
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Useful commands:

```powershell
pm2 status
pm2 logs tuckshop
pm2 restart tuckshop
```

---

## 7. Run Manually (Development / Testing)

**Backend:**

```powershell
npm run dev
```

**Frontend (separate terminal, dev only):**

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

For LAN dev testing from phones, set in `frontend/.env`:

```env
VITE_API_URL=http://192.168.1.10:5000
```

Then open `http://192.168.1.10:5173` on student devices.

In **production**, the backend serves the built frontend from `frontend/dist` — one URL only:

`http://192.168.1.10:5000`

---

## 8. Router / Wi-Fi Setup

1. Connect server PC to router via Ethernet.
2. Ensure school Wi-Fi allows **client-to-client** communication (some guest networks block this).
3. No port forwarding or internet required.
4. Optional: add a local DNS entry on the router for `tuckshop.local → 192.168.1.10`.

---

## 9. Windows Firewall

Allow inbound TCP on port **5000** (and **5173** for dev):

```powershell
netsh advfirewall firewall add rule name="Tuckshop Server" dir=in action=allow protocol=TCP localport=5000
```

---

## 10. Optional Nginx Reverse Proxy

See `nginx.conf.example`. Useful if you want port 80 instead of 5000:

```
http://192.168.1.10/
```

---

## 11. User Roles

| Role    | Login method              | Dashboard        |
|---------|---------------------------|------------------|
| Student | NFC card ID               | Shop, wallet, cart |
| Staff   | Email + password          | `/staff`         |
| Admin   | Email + password          | `/admin`         |

Create the first admin:

```powershell
npm run seed:admin
```

Default: `admin@school.local` / `admin123456` — **change immediately**.

Create staff accounts from the admin panel or via API:

```
POST /api/admin/users/staff
```

---

## 12. Health Check

```powershell
curl http://192.168.1.10:5000/api/health
```

Expected:

```json
{ "status": "ok", "mode": "offline-local" }
```

---

## 13. Security Checklist (Local Network)

- Change JWT secrets and admin password after install
- Use a dedicated tuckshop Wi-Fi VLAN if possible
- Do not expose port 5000 to the public internet
- Restrict physical access to the server PC
- Back up `uploads/` and MongoDB regularly:

```powershell
mongodump --uri="mongodb://127.0.0.1:27017/tuckshop" --out=C:\backups\tuckshop
```

---

## 14. Troubleshooting

| Problem | Fix |
|---------|-----|
| Phones can't reach server | Check firewall, static IP, same Wi-Fi subnet |
| CORS errors | Add device origin to `CLIENT_URL` or set `ALLOW_LAN=true` |
| Images not loading | Verify `uploads/products/` exists and `/uploads` route works |
| MongoDB won't connect | Ensure MongoDB service is running: `services.msc` |
| PM2 won't start | Run from project root; check `logs/pm2-error.log` |

---

## Folder Structure

```
j-commerce-tuckshop/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── lib/          # db, upload, cache
│   ├── scripts/      # seedAdmin.js
│   └── server.js
├── frontend/
│   └── src/
├── uploads/          # local product images
├── ecosystem.config.cjs
├── .env.example
└── DEPLOYMENT.md
```
