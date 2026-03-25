🛍️ Hari — Full-Stack E-Commerce Application

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


## ⚙️ Prerequisites

- **Node.js** v18+ → https://nodejs.org
- **MongoDB** → https://mongodb.com/atlas
- **Cloudinary** → https://cloudinary.com

---

## 🚀 Installation & Run

### Step 1
```bash
cd ecommerce-app/backend
Step 2
npm install
Step 3
cp .env.example .env

Edit .env:

PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=replace_with_a_long_random_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
Step 4
npm run dev
Step 5
http://localhost:5000
🔑 Admin Login
Field	Value
Email	admin@example.com

Password	your_admin_password
🌐 API Reference
Auth
Method	Endpoint
POST	/api/auth/signup
POST	/api/auth/login
GET	/api/auth/me
Products
Method	Endpoint
GET	/api/products
GET	/api/products/:id
POST	/api/products
PUT	/api/products/:id
DELETE	/api/products/:id
🔒 Security
bcrypt password hashing
JWT authentication
Role-based access
🛠️ Troubleshooting
Problem	Solution
MongoDB error	Check URI
Cloudinary error	Check keys
Port in use	Change PORT

---

# ✅ DONE

✔ Branding changed to **Hari**  
✔ Admin credentials secured  
✔ Safe for GitHub  

---

# 🚀 NEXT

Now do:

```bash
git add .
git commit -m "Updated README and branding"
git push