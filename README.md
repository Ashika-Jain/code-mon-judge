# 🚀 CodeMon – Online Code Judge Platform

[🔗 Live Demo »](https://code-mon-judge-9l3a-kqokgpvpg-ashikas-projects-8adbf12a.vercel.app/)

🛠️ **Tech Stack:** React, Node.js, Express, MongoDB, Docker, Kafka, Google OAuth

---

## 📌 Overview
**CodeMon** is a full-stack, production-ready online judge platform for solving, submitting, and reviewing coding problems. It supports C++, Python, and Java, and features everything from real-time code execution to mentor/AI feedback tools. Built with a scalable architecture, containerized with Docker, and deployed using AWS, Render, and Vercel.

---

## ✨ Key Features
- 🔐 **User Authentication:** Email/password & Google OAuth
- 🧠 **Code Execution & Judging:** Real-time run & submit functionality
- 📚 **Problem Management:** Browse, solve, and submit coding questions
- ⚡ **Asynchronous Judging:** Kafka (local dev) / Synchronous (production)
- 📈 **Profile Dashboard:** Stats, activity heatmap, and submission history
- 🧑‍🏫 **Admin/Mentor Tools:** AI-generated suggestions, verdict tracking
- 📜 **Verdict History:** Track and filter previous attempts & outcomes

---

## 🖼️ Screenshots (UI Previews)

| Feature                | Screenshot Placeholder         |
|-----------------------|-------------------------------|
| 🏠 Home Page          | _Coming Soon_                 |
| 📋 Problem List Page  | _Coming Soon_                 |
| ❓ Problem Detail View | _Coming Soon_                 |
| 💻 Code Editor        | _Coming Soon_                 |
| 📜 Submission History | _Coming Soon_                 |
| 👤 Profile Dashboard  | _Coming Soon_                 |
| 🧑‍🏫 Admin/Mentor Tools | _Coming Soon_               |

> Want to see it live? [Try the app!](https://code-mon-judge-9l3a-kqokgpvpg-ashikas-projects-8adbf12a.vercel.app/)

---

## 🛠️ Tech Stack

| Layer      | Tools & Technologies                       |
|------------|--------------------------------------------|
| Frontend   | React, Vite, Axios, Tailwind CSS           |
| Backend    | Node.js, Express.js, MongoDB (Mongoose)    |
| Execution  | Child Process, Docker (optional)           |
| Queue      | Kafka (for async judging – local only)      |
| Auth       | JWT, Google OAuth                          |
| DevOps     | Docker, AWS EC2 + ECR                      |
| Deployment | Backend → Render • Frontend → Vercel       |

---

## ⚙️ Local Setup Instructions

### 📦 Prerequisites
- Node.js & npm
- MongoDB (local or cloud via Atlas)
- (Optional) Kafka + Zookeeper for async judging

### 🧪 Steps
```bash
# 1. Clone the repository
git clone <your-repo-url>
cd codemon

# 2. Backend Setup
cd backend
npm install
# Set up .env with MONGODB_URI, JWT_SECRET, etc.
npm start

# 3. Frontend Setup
cd ../frontend
npm install
npm run dev

# 4. (Optional) Kafka Consumer (for local async judging)
cd ../backend
node kafka/consumer.js
```

---

## 🌍 Deployment Guide

| Component     | Platform | Notes                                 |
|---------------|----------|---------------------------------------|
| Frontend      | Vercel   | Set `VITE_API_BASE_URL` to backend URL|
| Backend       | Render   | Deploy as Web Service                 |
| Kafka Worker  | local    | Used only in async judging mode       |

---

## 🔑 Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` - Google OAuth
- `USE_KAFKA` - Set to `true` locally to enable Kafka
- `KAFKA_BROKER` - Kafka broker address (local or managed)

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
[MIT](LICENSE)
