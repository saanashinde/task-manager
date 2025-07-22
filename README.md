# Task Manager

A modern, responsive, and feature-rich task management app built with React, Vite, and CSS Modules. Designed for usability, accessibility, and a delightful user experience—perfect for interviews and real-world productivity!

---

> **Note:**
> - All components are functional and use React Hooks only (no class components).
> - Styling is done exclusively with CSS Modules.
> - No utility frameworks/libraries such as Bootstrap, Tailwind, or Ant Design are used.

---

## 🚀 Features

- **Add, complete, and delete tasks**
- **Due dates** with countdowns and overdue highlighting
- **Undo delete** with snackbar/toast
- **Animated progress bar** for completion rate
- **Floating Action Button (FAB)** for quick task entry (modal form)
- **Confetti** animation on task completion
- **Animated task list transitions** (add/remove)
- **Search and filter** tasks in real time
- **Reminders** for tasks due soon
- **Analytics dashboard**: total, completed, incomplete, completion rate, streaks, due today, overdue
- **Responsive design** for mobile and desktop
- **Accessibility**: ARIA labels, keyboard navigation, focus styles
- **Local storage persistence** (no backend required)

---

## 📦 Tech Stack

- **Framework:** React.js (with Vite)
- **Components:** Functional components & React Hooks
- **Styling:** CSS Modules (no Bootstrap, Tailwind, or Ant Design)
- **State Management:** React local state & hooks
- **Persistence:** Browser localStorage

---

## 🛠️ Setup & Usage

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
3. **Open your browser:**
   Visit [http://localhost:5173](http://localhost:5173)

---

## 📋 Project Structure

- `src/`
  - `App.tsx` — Main app logic, state, and layout
  - `components/` — Modular UI components (TaskForm, TaskList, TaskItem, etc.)
  - `types.ts` — TypeScript types
  - `App.module.css` — Global and layout styles

---

## 💡 Bonus Features

- Confetti on completion
- Undo delete with snackbar
- Animated transitions
- Analytics dashboard
- Reminders for due tasks
- Floating Action Button (FAB)
- Accessibility best practices

---

## 🧑‍💻 Author & Interview Notes

- **All requirements met:**
  - Functional components, hooks, CSS Modules
  - No forbidden libraries/frameworks
  - Fully responsive and accessible
  - Local state and persistence only
- **Bonus:**
  - Modern UI/UX, animations, and advanced features

---

## 📄 License

MIT
