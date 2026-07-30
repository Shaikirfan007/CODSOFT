# Quizify - Online Quiz Maker Platform
##Explore new questions and answers


##Project Overview

**Quizify** is a web-based platform that enables users to create and take quizzes with real-time feedback. It's a full-stack application built with modern technologies including React, Node.js, Express, and MongoDB.

### Project Type
**CODSOFT Web Development Internship - Level 2, Task 2: Online Quiz Maker**

---

## ✨ Features Implemented

### ✅ **Home Page**
- Welcome message with platform introduction
- Navigation to create or take quizzes
- User authentication status display

### ✅ **User Authentication**
- User registration with email validation
- Secure login system
- Password encryption using bcryptjs
- JWT-based session management
- Protected routes for authenticated users

### ✅ **Quiz Creation Interface**
- Intuitive form to create new quizzes
- Add quiz title and description
- Dynamic question builder
- Support for 4 multiple-choice options per question
- Radio button selection for marking correct answer
- Add/remove questions dynamically
- Form validation for all fields
- Minimum 3 questions requirement

### ✅ **Quiz Listing Page**
- Display all available quizzes in card layout
- Show quiz title, description, and question count
- Filter and browse quizzes created by other users
- Quick access to take any quiz

### ✅ **Quiz Taking Interface**
- Display one question at a time
- Interactive option selection with visual feedback
- Progress bar showing quiz completion percentage
- Navigation between questions (Previous/Next)
- Answer tracking and management
- Prevent submission without answering all questions

### ✅ **Quiz Results & Feedback**
- Show final score as percentage
- Display total correct answers
- Detailed result breakdown for each question
- Show correct answer for each question
- Highlight user's answer vs correct answer
- Color-coded feedback (green for correct, red for incorrect)


## 🛠️ Technology Stack

### **Frontend**
- React 18
- Vite
- Tailwind CSS
- JavaScript (ES6+)

### **Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- bcryptjs
- jsonwebtoken

---

## 📁 Project Structure

```
quizify/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm

### **Backend Setup**

```bash
cd backend
npm install

# Create .env file with:
PORT=5000
MONGO_URI=mongodb://localhost:27017/quizify
JWT_SECRET=your_secret_key_here

npm run dev
```

### **Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

**Access**: Open browser and go to `http://localhost:5173`

---

## 📝 API Endpoints

```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
GET    /api/quizzes           - Get all quizzes
GET    /api/quizzes/:id       - Get specific quiz
POST   /api/quizzes           - Create new quiz (protected)
POST   /api/quizzes/:id/submit - Submit quiz answers
```

---

## 🎯 How to Use

### **1. Register/Login**
- Click "Register" to create a new account
- Enter name, email, and password
- Or login if you already have an account

### **2. Create a Quiz**
- Click "➕ Create Quiz" in the navbar
- Enter quiz title and description
- Add questions with 4 multiple-choice options
- Select the correct answer for each question
- Add minimum 3 questions
- Click "✅ Create Quiz" to publish

### **3. Take a Quiz**
- Go to Dashboard
- Click "Start →" on any quiz
- Answer each question by clicking an option
- Use "Previous" and "Next" to navigate
- Answer all questions and click "✅ Submit Quiz"

### **4. View Results**
- See your score as percentage
- View detailed feedback for each question
- See which answers were correct/incorrect

---

## ✅ CODSOFT Requirements Checklist

- ✅ Home Page with welcome message and quiz options
- ✅ Quiz Creation form with questions and options
- ✅ Quiz Taking interface displaying questions one at a time
- ✅ Quiz Results showing final score and correct answers
- ✅ Quiz Listing displaying available quizzes
- ✅ User Authentication with registration and login
- ✅ Immediate Feedback after quiz completion
- ✅ Form Validation for all inputs
- ✅ Error Handling with proper messages

---

## 🔐 Authentication & Validation

- Password encryption using bcryptjs
- JWT-based login system
- Protected routes (only logged-in users can create quizzes)
- Form validation on both frontend and backend
- Input sanitization for security

---

## 📊 Database Schema

### **User**
```
- name: String
- email: String (unique)
- password: String (encrypted)
```

### **Quiz**
```
- title: String
- description: String
- questions: Array
  - questionText: String
  - options: Array of Strings
  - correctAnswer: Number
```



## 👨‍💻 Developer Information

**Built by**: Shaik Irfan  
**Internship**: CODSOFT Web Development Program  
**Batch**: December B71  
**Date**: December 2025

---

## 📝 Project Notes

- All code written from scratch for this internship
- Followed best practices for React and Node.js development
- Custom authentication and form validation implemented

---

## 🤝 Support

For questions or issues:
- Email: contact@codsoft.in
- Telegram: https://t.me/codsoftt
- Website: https://www.codsoft.in/

---
