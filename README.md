🛍️ Hari — Full-Stack E-Commerce Application

A production-ready e-commerce web app for ethnic wear (Kurtis & Suits), featuring:
- JWT authentication with role-based access
- Admin dashboard with full product CRUD
- Cloudinary image upload (PC & mobile)
- MongoDB persistence
- Responsive modern UI

---

## 📁 Project Structure


ecommerce-app/
├── backend/
│ ├── config/
│ │ ├── cloudinary.js
│ │ ├── db.js
│ │ └── seedAdmin.js
│ ├── controllers/
│ │ ├── authController.js
│ │ └── productController.js
│ ├── middleware/
│ │ ├── authMiddleware.js
│ │ ├── roleMiddleware.js
│ │ └── uploadMiddleware.js
│ ├── models/
│ │ ├── User.js
│ │ └── Product.js
│ ├── routes/
│ │ ├── authRoutes.js
│ │ └── productRoutes.js
│ ├── server.js
│ ├── package.json
│ │ └── .env.example
│
└── frontend/
├── css/
│ └── style.css
├── js/
│ └── shared.js
├── index.html
├── login.html
├── signup.html
├── products.html
└── admin.html


---

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