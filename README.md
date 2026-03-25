# 🛍️ Hari — Full-Stack E-Commerce Application

A production-ready e-commerce web app for ethnic wear (Kurtis & Suits), featuring:
- JWT authentication with role-based access
- Admin dashboard with full product CRUD
- Cloudinary image upload (PC & mobile)
- MongoDB persistence
- Responsive modern UI

---

## 📁 Project Structure

```
ecommerce-app/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js       # Cloudinary setup + upload/delete helpers
│   │   ├── db.js               # MongoDB connection
│   │   └── seedAdmin.js        # Auto-seeds admin on first run
│   ├── controllers/
│   │   ├── authController.js   # signup, login, getMe
│   │   └── productController.js# getAllProducts, getProduct, createProduct, updateProduct, deleteProduct
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   ├── roleMiddleware.js   # Role-based access (admin check)
│   │   └── uploadMiddleware.js # Multer (memory storage, 2MB limit)
│   ├── models/
│   │   ├── User.js             # User schema (name, email, password, role)
│   │   └── Product.js          # Product schema (name, price, category, description, imageUrl, imagePublicId)
│   ├── routes/
│   │   ├── authRoutes.js       # POST /api/auth/signup, /login | GET /api/auth/me
│   │   └── productRoutes.js    # GET/POST /api/products | GET/PUT/DELETE /api/products/:id
│   ├── server.js               # Express entry point
│   ├── package.json
│   └── .env.example            # Environment variable template
│
└── frontend/
    ├── css/
    │   └── style.css           # Complete responsive stylesheet
    ├── js/
    │   └── shared.js           # API helpers, toast, auth utilities
    ├── index.html              # Home page
    ├── login.html              # Login page
    ├── signup.html             # Sign up page
    ├── products.html           # Product listing with filter/search
    └── admin.html              # Admin dashboard (CRUD + image upload)
```

---

## ⚙️ Prerequisites

- **Node.js** v18+ → https://nodejs.org
- **MongoDB** (local) OR **MongoDB Atlas** (cloud) → https://mongodb.com/atlas
- **Cloudinary** account (free tier works) → https://cloudinary.com

---

## ☁️ Cloudinary Setup

1. **Create a free account** at https://cloudinary.com/users/register/free

2. **Find your credentials** on the Cloudinary Dashboard:
   - `Cloud Name`
   - `API Key`
   - `API Secret`

3. **Create an upload preset** (optional, not required — the app uses direct upload):
   - Settings → Upload → Upload presets → Add preset → Unsigned

4. **Copy your credentials** into your `.env` file (see below).

---

## 🚀 Installation & Run

### Step 1 — Clone / navigate to the project

```bash
cd ecommerce-app/backend
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Configure environment variables

```bash
cp .env.example .env
```

Then open `.env` and fill in:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=replace_with_a_long_random_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

> **MongoDB Atlas URI example:**
> `MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce`

### Step 4 — Start the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

### Step 5 — Open in browser

```
http://localhost:5001
```

---

## 🔑 Admin Login

| Field    | Value              |
|----------|--------------------|
| Email    |  admin@example.com |
| Password | your_admin_password|

> Admin is **auto-created** the first time the server starts — no manual database seeding needed!

---

## 🌐 API Reference

### Auth

| Method | Endpoint           | Auth | Body                          |
|--------|--------------------|------|-------------------------------|
| POST   | /api/auth/signup   | —    | `{name, email, password}`     |
| POST   | /api/auth/login    | —    | `{email, password}`           |
| GET    | /api/auth/me       | JWT  | —                             |

### Products

| Method | Endpoint             | Auth        | Body/Params                              |
|--------|----------------------|-------------|------------------------------------------|
| GET    | /api/products        | —           | Query: `category`, `search`, `page`, `limit` |
| GET    | /api/products/:id    | —           | —                                        |
| POST   | /api/products        | Admin JWT   | FormData: `name, price, category, description, image` |
| PUT    | /api/products/:id    | Admin JWT   | FormData: any of above fields            |
| DELETE | /api/products/:id    | Admin JWT   | —                                        |

---

## 🖼️ Image Upload Details

- **Library:** Multer (memoryStorage) + Cloudinary Node SDK
- **Storage:** Images are never saved to disk — buffer is streamed directly to Cloudinary
- **Accepted types:** JPG, JPEG, PNG, WebP
- **Max file size:** 2 MB (enforced by Multer on backend + JS validation on frontend)
- **Image preview:** FileReader API shows local preview before upload
- **Drag & drop:** Supported on the admin dashboard
- **On delete:** Cloudinary `destroy()` is called automatically when a product is deleted
- **On update:** Old Cloudinary image is deleted before uploading the new one

---

## 🔒 Security

- Passwords hashed with **bcryptjs** (12 salt rounds)
- Routes protected with **JWT** middleware
- Admin routes additionally protected with **role middleware**
- `password` field excluded from all DB queries by default (`select: false`)
- Input validation on all routes

---

## 📱 Responsive Design

The frontend is fully responsive across:
- Desktop (1200px+)
- Tablet (768px–1024px)
- Mobile (< 768px)

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| `ECONNREFUSED` on MongoDB | Start MongoDB locally: `mongod` or use Atlas URI |
| Cloudinary upload fails | Check `CLOUDINARY_CLOUD_NAME`, `API_KEY`, `API_SECRET` in `.env` |
| `Invalid token` errors | Make sure `JWT_SECRET` is set and consistent |
| Admin not found | Delete the database and restart — `seedAdmin` will recreate it |
| Images not loading | Check Cloudinary dashboard → Media Library |
| Port already in use | Change `PORT` in `.env` to e.g. `5001` |
