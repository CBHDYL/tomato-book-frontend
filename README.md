
---

# Tomato Book – Frontend

A modern, feature-rich **task management & Pomodoro productivity frontend** built with React and TypeScript.
This project focuses on **clean architecture, scalable state management, and user-centered UI/UX design**.

> This repository contains **frontend code only**.
> Backend services are maintained in a separate repository.

---

## ✨ Features

* 🔐 **Authentication & Authorization**

  * Login / Register
  * Protected routes & admin-only routes

* 🧠 **Task Management**

  * Create / edit / delete tasks
  * Task preview & editor modals
  * Status, priority, and deadline handling

* ⏱️ **Pomodoro System**

  * Focus sessions with configurable settings
  * Session tracking & statistics

* 📊 **Insights & Analytics**

  * Productivity insights
  * AI-assisted recommendation logic (frontend integration)

* 🛠️ **Admin Dashboard**

  * User management
  * Task & Pomodoro monitoring
  * Admin-only analytics pages

* 🎨 **UI & UX**

  * Modular UI components (Button, Card, Modal, Toast, etc.)
  * Responsive layout
  * Clean and consistent design system

---

## 🧱 Tech Stack

### Core

* **React 18**
* **TypeScript**
* **Vite**

### State & Data

* **TanStack Query** (server state)
* **Zustand** (UI / local state)
* **Custom API abstraction layer**

### Styling & UI

* CSS Modules / global CSS
* Reusable component-based UI design

### Tooling

* ESLint
* Modular project structure
* Strong typing & separation of concerns

---

## 📁 Project Structure

```text
src/
├── app/              # App-level routing, providers, constants
├── components/       # Reusable UI & common components
├── features/         # Feature-based modules (auth, tasks, pomodoro, admin…)
├── layout/           # Layout & navigation
├── pages/            # Page-level components
├── services/         # HTTP & storage utilities
├── utils/            # Shared helpers
├── mock/             # Mock / seed data
└── main.tsx          # App entry
```

> The project follows a **feature-based architecture** for scalability and maintainability.

---

## 🚀 Getting Started

### Prerequisites

* Node.js ≥ 18
* npm

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

The app will be available at:

```
http://localhost:5173
```

---

## 🔌 Backend Integration

This frontend is designed to work with a **Spring Boot backend** via REST APIs.

* API layer is abstracted in `src/services/`
* All feature modules communicate through typed API functions
* Easy to swap environments (dev / prod)

> Backend repository will be linked separately.

---

## 📌 Design & Architecture Notes

* Feature-based folder structure
* Clear separation between:

  * UI
  * business logic
  * API communication
* Emphasis on:

  * maintainability
  * scalability
  * real-world project standards

---

## 📈 Project Status

* Frontend core features: **Completed**
* UI & UX: **Actively refined**
* Backend integration: **Ongoing**
* Deployment: **Planned**

---

## 👤 Author

**Bohong Chen**
Information Technology (ITEC) student
Focused on frontend architecture, system design, and full-stack development

---

## 📄 License

This project is for **educational and portfolio purposes**.

---


