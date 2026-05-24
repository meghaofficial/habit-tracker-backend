# Habit Tracker Backend 🔧

A robust RESTful API backend for the Habit Tracker application, built with Express.js, TypeScript, and MongoDB. This server handles user authentication, habit management, tracking, and analytics.

## 🌟 Features

- **User Authentication**: JWT-based authentication with Google OAuth support
- **Habit CRUD Operations**: Create, read, update, and delete habits
- **Progress Tracking**: Record daily habit completions and calculate streaks
- **Analytics**: Generate statistics and insights about habit patterns
- **Database Persistence**: MongoDB integration with Mongoose ODM
- **Security**: Password encryption with bcryptjs, CORS configuration
- **Scheduled Tasks**: Automated tasks using node-cron
- **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: 
  - JWT (JSON Web Tokens)
  - Passport.js with Google OAuth 2.0
  - bcryptjs for password hashing
- **Utilities**:
  - CORS for cross-origin requests
  - Cookie Parser for session handling
  - node-cron for scheduled tasks
  - dotenv for environment variables

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or Atlas cloud)
- Google OAuth credentials (for OAuth integration)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/meghaofficial/habit-tracker-backend.git
cd habit-tracker-backend
