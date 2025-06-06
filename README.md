# SmartDesk

This project is a modern **interactive calendar application** built with **Svelte**. It offers a dynamic and modular interface, allowing users to manage events and display various **custom widgets** such as calc, notes, timer, or spotify.

## 🚀 Technologies Used

- 🌐 Frontend Framework: [Svelte](https://svelte.dev/)
- 📦 Package Manager: NPM
- 🗃 State Management: Svelte stores
- 🔧 Tooling: Vite (for fast dev environment)

## 🛠 Requirements

- Node.js (v16+ recommended)
- NPM (or Yarn)

## 📦 Project Setup

```bash
git clone https://github.com/your-username/interactive-calendar.git
cd interactive-calendar
npm install
npm run dev
```

## 🧩 Features

📆 Interactive calendar with month/week/day views
🧱 Widget system: add/remove widgets to the dashboard
📝 Event creation and editing
🔔 Reminders and notifications
🎨 Responsive and user-friendly UI

## 🧑‍💻 Developer Notes

This app is entirely built using Svelte and follows a modular component architecture. It aims to demonstrate:
- Component-based design
- Reactive state handling
- Use of Svelte transitions and animations
- Dynamic rendering of user-configurable content (widgets)

## 📁 Project Structure
```
src/
├── components/        # Reusable Svelte components
├── widgets/           # All calendar widgets (e.g. weather, tasks, etc.)
├── routes/            # Page routes
├── stores/            # Centralized state management
├── assets/            # Static files and icons
└── App.svelte         # Main application entry
```
