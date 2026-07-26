# 🚀 Friction

> **Find. Play. Belong.**

Friction is a modern sports networking and venue booking platform that helps people discover nearby games, connect with other players, book sports venues, and rent or purchase sports equipment—all from a single application.

Designed with a premium mobile-first experience inspired by Apple's design philosophy, Friction aims to remove the friction involved in organizing sports activities.

---

## ✨ Features

### 🏃 Discover Nearby Games

* Find sports games happening around you
* Filter by sport, skill level, and intensity
* View upcoming games in real time

### 🤝 Create & Join Games

* Create games at verified sports venues
* Set player capacity and required participants
* Join existing games with live participant updates
* Organizer receives real-time join notifications

### 🏟️ Venue Booking

* Browse verified partner sports facilities
* View venue details, amenities, pricing, and images
* Book available slots directly through the app
* Automated booking confirmation with unique Friction Booking IDs

### 🏸 Equipment Marketplace

* Buy or rent sport-specific equipment
* Equipment recommendations based on selected sport
* Shopping cart with quantity controls
* Secure checkout workflow
* Equipment purchase & rental history

### 📊 Activity Dashboard

* Apple Fitness-inspired Activity Score
* Weekly participation summary
* Activity history
* Equipment history
* Upcoming and past games

### 👤 Personalized Profiles

* Fitness level tracking
* Sports preferences
* Experience levels
* Unique Friction username
* Personal statistics

---

# 📱 Screens

* Authentication
* User Onboarding
* Discover
* Venue Details
* Create Game
* Game Details
* Equipment Store
* Activity Dashboard
* Profile
* Checkout
* Booking Confirmation

---

# 🏗️ System Architecture

```
                    Friction Mobile App
                           │
                           │
                     Supabase Backend
       ┌───────────────────┼────────────────────┐
       │                   │                    │
 Authentication      PostgreSQL DB        Storage
       │                   │                    │
       │          Row Level Security           │
       │                   │                    │
       ├────────────── RPC Functions ──────────┤
       │
Notifications • Games • Venues • Equipment
Bookings • Payments • Activity • Profiles
```

---

# 🔒 Production Booking Engine

Friction includes a production-oriented booking system designed to prevent double bookings.

### Features

* Atomic booking transactions
* Slot locking mechanism
* Booking lifecycle
* Automatic lock expiry
* Weekly recurring slot templates
* Unique booking constraints
* Payment confirmation workflow

Booking lifecycle:

```
Available
     │
     ▼
 Locked
     │
     ├────► Cancelled
     │
     ▼
Booked
```

---

# 🛠 Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion
* Capacitor (Native Support)

## Backend

* Supabase
* PostgreSQL
* Row Level Security (RLS)
* Database Triggers
* PostgreSQL RPC Functions
* Supabase Auth

## Database

* Normalized Relational Schema
* Atomic Transactions
* Foreign Keys
* Constraints
* Database Indexes

---

# 🗂 Database Overview

Core entities include:

* Users
* Profiles
* Sports
* Venues
* Venue Slot Templates
* Venue Slots
* Games
* Game Participants
* Equipment
* Orders
* Payments
* Notifications
* Activity History

---

# 🔐 Authentication

* Email & Password Authentication
* Secure Session Management
* Protected Routes
* User Profile Initialization
* Unique Username Validation

---

# 🎨 Design Philosophy

Friction is designed with a premium mobile-first interface inspired by modern fitness applications.

Highlights include:

* Dark Theme
* Glassmorphism
* Rounded Floating Navigation
* Smooth Animations
* Premium Typography
* Minimal UI
* Apple Fitness-inspired Activity Rings

---

# ⚡ Current Features

* ✅ Authentication
* ✅ User Onboarding
* ✅ Venue Discovery
* ✅ Game Creation
* ✅ Join Games
* ✅ Venue Booking
* ✅ Equipment Rentals
* ✅ Equipment Purchases
* ✅ Booking Confirmation
* ✅ Activity Tracking
* ✅ Notifications
* ✅ User Profiles
* ✅ Booking History
* ✅ Responsive UI

---

# 🚧 Upcoming Features

* Partner Dashboard
* Live Chat
* Team Creation
* Leaderboards
* Ratings & Reviews
* QR Code Check-In
* UPI Payment Gateway Integration
* Push Notifications
* AI Venue Recommendations
* Apple Health / Google Fit Integration
* Tournament Management

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/lakshay-bhatnagar/friction.git
```

## Install Dependencies

```bash
npm install
```

## Configure Environment

Create a `.env` file:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_ANON_KEY
VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
```

## Run Development Server

```bash
npm run dev
```

---

# 📂 Project Structure

```
src/
 ├── components/
 ├── pages/
 ├── hooks/
 ├── integrations/
 ├── services/
 ├── lib/
 ├── utils/
 └── assets/

supabase/
 ├── migrations/
 └── config/
```

---

# 🤝 Contributing

Contributions, feature requests, and bug reports are welcome.

If you'd like to contribute, please fork the repository and submit a pull request.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Lakshay Bhatnagar**

Software Engineer • Cybersecurity Enthusiast • Full-Stack Developer

---

## ⭐ If you like this project

Give it a ⭐ on GitHub and help support the project.
