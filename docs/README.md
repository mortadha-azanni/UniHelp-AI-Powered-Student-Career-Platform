# Job Application Management System

> A comprehensive full-stack web application designed to help job seekers manage their job applications, prepare for interviews, and optimize their professional profiles.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Documentation](#documentation)
- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## 🎯 Overview

This job application management system is a full-featured platform that helps users throughout their entire job search journey. From building and managing professional profiles to generating tailored CVs, tracking applications, and preparing for interviews with AI-powered tools.

## ✨ Key Features

### 🔐 Authentication & Security
- JWT-based authentication with access and refresh tokens
- Secure password hashing with bcrypt
- HttpOnly cookies for token storage
- Rate limiting to prevent brute force attacks
- Protected routes and authorization middleware

### 👤 Profile Management
- Comprehensive profile builder with multiple sections:
  - Personal information
  - Education history
  - Work experience
  - Projects portfolio
  - Technical and soft skills
  - Certifications
  - Languages
- Profile completeness tracking
- Profile validation and suggestions

### 📄 CV Generation
- AI-powered CV generation using n8n workflows
- LaTeX-based professional CV templates
- Multiple CV versions management
- CV history and versioning
- Link CVs to specific job applications
- Download, save to Overleaf, or store in database

### 💼 Job Application Tracking
- Comprehensive application management
- Track application status (Applied, Interview, Offer, Rejected, Withdrawn)
- Job types (Internship, Full-Time, Part-Time, Contract, Freelance)
- Application statistics and analytics
- Interview scheduling and notes
- Salary tracking
- Application filtering and search

### 🧠 Profile Critique
- AI-powered profile analysis
- Identifies strengths and weaknesses
- Provides actionable improvement suggestions
- Overall profile scoring
- Integration with n8n for intelligent analysis

### 🎯 Interview Preparation
- AI-generated interview questions based on:
  - Your CV/profile
  - Job description
  - Required skills
- Technical interview quiz generation
- HR interview question practice
- Custom question generation via n8n

### ✅ Todo & Task Management
- Task categorization (Skill Gap, Learning Objective, Application Follow-up, General)
- Priority levels (Low, Medium, High)
- Progress tracking
- Due dates and overdue tracking
- Resource management per task
- Link tasks to job applications
- Statistics and completion tracking

## 📚 Documentation

Detailed documentation is available in the following files:

- **[SETUP.md](./SETUP.md)** - Installation and configuration guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design patterns
- **[API.md](./API.md)** - Complete API reference
- **[DATABASE.md](./DATABASE.md)** - Database schema and models
- **[COMPONENTS.md](./COMPONENTS.md)** - Frontend component structure
- **[FEATURES.md](./FEATURES.md)** - Detailed feature documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 16 or higher
- MongoDB (optional - can use JSON file storage for development)
- n8n instance (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Project-ING1-s1
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env` files based on the examples provided:
   
   **Server** (`server/.env`):
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   NODE_ENV=development
   
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   
   CLIENT_URL=http://localhost:5173
   N8N_WEBHOOK_URL=your_n8n_webhook_url
   ```
   
   **Client** (`client/.env`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development servers**
   
   ```bash
   # Terminal 1 - Start backend
   cd server
   npm run dev
   
   # Terminal 2 - Start frontend
   cd client
   npm run dev
   ```

5. **Access the application**
   
   Open your browser and navigate to `http://localhost:5173`

For detailed setup instructions, see [SETUP.md](./SETUP.md).

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken), bcrypt
- **Security**: CORS, express-rate-limit, cookie-parser
- **Integration**: Axios for external API calls (n8n)

### Frontend
- **Framework**: React 19
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Styling**: TailwindCSS 4 with custom CSS

### External Services
- **n8n**: Workflow automation for AI features
  - CV generation (LaTeX)
  - Profile critique
  - Interview question generation

## 📁 Project Structure

```
Project-ING1-s1/
├── client/                      # React frontend
│   ├── src/
│   │   ├── api/                 # API service layer
│   │   │   ├── axios.js         # Axios configuration
│   │   │   ├── cvApi.js         # CV API calls
│   │   │   ├── hrInterviewApi.js
│   │   │   ├── jobApplicationsApi.js
│   │   │   ├── profileApi.js
│   │   │   ├── profileCritiqueApi.js
│   │   │   ├── technicalInterviewApi.js
│   │   │   └── todosApi.js
│   │   ├── components/          # React components
│   │   │   ├── interview/       # Interview-related components
│   │   │   ├── ApplicationFilters.jsx
│   │   │   ├── ApplicationModal.jsx
│   │   │   ├── ApplicationsTable.jsx
│   │   │   ├── ApplicationStats.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── TodoWidget.jsx
│   │   ├── context/             # React Context
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── pages/               # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DashboardHome.jsx
│   │   │   ├── GenerateCVPage.jsx
│   │   │   ├── InterviewPrepPage.jsx
│   │   │   ├── JobApplicationsPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ProfileCritiquePage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── server/                      # Node.js backend
    ├── controllers/             # Request handlers
    │   ├── authController.js
    │   ├── cvController.js
    │   ├── hrInterviewController.js
    │   ├── jobApplicationController.js
    │   ├── profileController.js
    │   ├── profileCritiqueController.js
    │   ├── technicalInterviewController.js
    │   └── todoController.js
    ├── middleware/              # Express middleware
    │   ├── auth.js              # JWT authentication
    │   └── errorHandler.js      # Error handling
    ├── models/                  # Mongoose models
    │   ├── User.js
    │   ├── Profile.js
    │   ├── JobApplication.js
    │   ├── CV.js
    │   ├── TodoItem.js
    │   └── RefreshToken.js
    ├── routes/                  # API routes
    │   ├── auth.js
    │   ├── cvs.js
    │   ├── hrInterview.js
    │   ├── jobApplications.js
    │   ├── profile.js
    │   ├── profileCritique.js
    │   ├── technicalInterview.js
    │   └── todos.js
    ├── utils/                   # Utility functions
    ├── data/                    # JSON file storage (dev mode)
    ├── index.js                 # Server entry point
    └── package.json
```

## 🤝 Contributing

Contributions are welcome! Please ensure you:

1. Follow the existing code style and structure
2. Test your changes thoroughly
3. Update documentation as needed
4. Create meaningful commit messages

## 📄 License

This project is for educational purposes.

## 🔗 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [n8n Documentation](https://docs.n8n.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

For more information, please refer to the detailed documentation files in the `docs/` directory.
