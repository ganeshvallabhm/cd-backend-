# Backend Structure - Quick Reference

## 📁 New Directory Structure

```
ck-homemade-foods-backend/
│
├── 📄 app.js                    ← Express app configuration
├── 📄 server.js                 ← Entry point (starts server)
├── 📄 package.json
├── 📄 .env
│
└── 📁 src/
    ├── 📄 db.js                 ← Database connection
    │
    ├── 📁 models/
    │   └── Order.js
    │
    ├── 📁 routes/
    │   └── orderRoutes.js
    │
    └── 📁 services/
        └── emailService.js
```

## 🔄 Request Flow

```
Client Request
    ↓
http://localhost:5000/api/orders
    ↓
server.js (loads env, connects DB, starts server)
    ↓
app.js (Express middleware)
    ↓
1. CORS middleware
    ↓
2. JSON parser
    ↓
3. Routes (/api/orders → orderRoutes)
    ↓
4. Error handler (if error occurs)
    ↓
Response to Client
```

## 🚀 Quick Start

```bash
# Start server
npm start

# Or development mode
npm run dev
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/:id` | Get order by ID |

## ✅ What Changed

| Before | After |
|--------|-------|
| `server.js` (everything) | `server.js` (startup only) |
| - | `app.js` (Express config) |
| `/models/` | `/src/models/` |
| `/routes/` | `/src/routes/` |
| `/services/` | `/src/services/` |
| - | `/src/db.js` (DB connection) |

## 🎯 Key Benefits

✅ Clean separation of concerns  
✅ Organized src/ directory  
✅ Proper middleware order  
✅ Zero CORS issues  
✅ Zero routing issues  
✅ Easy to maintain and scale
