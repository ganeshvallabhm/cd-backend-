# CK Homemade Foods Backend

Backend API for the CK Homemade Foods ordering system built with Node.js, Express, and MongoDB.

## 🚀 Features

- RESTful API for order management
- MongoDB database integration
- Order tracking with unique order numbers
- Status management (pending, confirmed, preparing, out-for-delivery, delivered, cancelled)
- Input validation
- Error handling
- CORS enabled

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env` file and update the values:
     - `MONGODB_URI`: Your MongoDB connection string
     - `PORT`: Server port (default: 5000)
     - `FRONTEND_URL`: Your frontend URL for CORS

3. Start MongoDB (if running locally):
```bash
mongod
```

## 🏃 Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📡 API Endpoints

### Orders

- **POST** `/api/orders` - Create a new order
- **GET** `/api/orders` - Get all orders (with pagination and status filter)
- **GET** `/api/orders/:id` - Get order by ID
- **GET** `/api/orders/number/:orderNumber` - Get order by order number
- **PATCH** `/api/orders/:id/status` - Update order status
- **DELETE** `/api/orders/:id` - Delete an order

### Health Check

- **GET** `/health` - Server health check

## 📦 Order Schema

```javascript
{
  customerName: String,
  email: String,
  phone: String,
  address: String,
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  subtotal: Number,
  deliveryFee: Number,
  total: Number,
  status: String,
  paymentMethod: String,
  paymentStatus: String,
  notes: String,
  orderNumber: String (auto-generated),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Notes

- Update `JWT_SECRET` in `.env` before production
- Add authentication middleware for protected routes
- Implement rate limiting for production
- Use HTTPS in production
- Validate and sanitize all user inputs

## 📝 License

ISC
