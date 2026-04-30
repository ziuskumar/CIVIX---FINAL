<div align="center">

<img src="https://img.shields.io/badge/MERN-Stack-4DB33D?style=for-the-badge" />
<img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/Auth-Passport.js-yellow?style=for-the-badge" />

</div>

# CIVIX – Digital Civic Engagement Platform

🌐 Live Demo
https://civixi.netlify.app/

## 📌 Project Overview

CIVIX is a full-stack MERN application designed to enhance civic participation by allowing citizens to create petitions, vote on public issues, and interact with officials. The platform ensures transparency, accountability, and community-driven governance.

---

## 🚀 Features

### 🔐 Authentication & Roles

- User registration & login system
- Role-based access (Citizen / Official)
- Secure authentication using Passport.js (session-based)

### 📢 Petition System

- Create, update, delete petitions
- Sign petitions
- Filter by category and location

### 🗳️ Polling System

- Create public polls
- Vote on civic issues
- View sentiment results

### 📊 Dashboard

- Citizen dashboard (create & track petitions)
- Official dashboard (respond to petitions)
- Reports & analytics (future scope)

---

## 🏗️ Tech Stack

### 🔹 Frontend

- React (Vite)
- JavaScript (ES6+)
- Tailwind CSS

### 🔹 Backend

- Node.js
- Express.js
- Passport.js
- express-session

### 🔹 Database

- MongoDB
- Mongoose

### 🔹 Security

- bcrypt (password hashing)
- Session-based authentication

---

## 🧠 Architecture

CIVIX follows a **Client–Server Architecture**:

Frontend (React) → Backend (Express APIs) → MongoDB

---

## 📂 Project Structure

```bash
CIVIX/
│
├── backend/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth & role checks
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   ├── scripts/         # Optional scripts
│   ├── server.js        # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/             # React components & pages
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/ziuskumar/CIVIX-.git
cd CIVIX-
```

---

### 2️⃣ Setup Backend

```bash
cd backend
npm install
node server.js
```

Backend runs on:

```
http://localhost:5000
```

---

### 3️⃣ Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔗 API Example

### Health Check

```http
GET /api/health
```

Response:

```json
{
  "status": "Backend running fine"
}
```

---

## 🔐 Authentication Flow

1. User enters login credentials
2. Request sent to backend
3. Passport verifies user
4. Password checked using bcrypt
5. Session created and stored
6. User stays logged in via cookies

---

## 🛡️ Security Features

- Password hashing (bcrypt)
- Session-based authentication
- Role-based route protection
- CORS handling for frontend-backend communication

---

## 📈 Future Improvements

- JWT authentication
- Real-time updates (Socket.io)
- Geo-location filtering
- Admin dashboard
- Email notifications

---

## 🎯 Learning Outcomes

- Full-stack MERN development
- Authentication & session handling
- REST API design
- Role-based access control
- Real-world system design

---

## 👨‍💻 Author

ZIUS KUMAR
---

## ⭐ Conclusion
