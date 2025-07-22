/**
 * Main App component for the Task Manager.
 * Handles state, persistence, analytics, and UI composition.
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Task, FilterStatus } from './types';
import Header from './components/Header/Header';
import TaskForm from './components/TaskForm/TaskForm';
import TaskList from './components/TaskList/TaskList';
import FilterControls from './components/FilterControls/FilterControls';
import styles from './App.module.css';
import confetti from 'canvas-confetti';

const UNDO_TIMEOUT = 4000;

/**
 * Calculate current and longest streaks of days with at least one completed task.
 * @param tasks Array of Task objects
 */
function getStreaks(tasks: Task[]) {
  // Only consider completed tasks with a dueDate or creation date
  const days = new Set<string>();
  const completedDays = tasks
    .filter(t => t.completed)
    .map(t => t.dueDate || new Date(t.id).toISOString().slice(0, 10));
  completedDays.forEach(dateStr => {
    days.add(dateStr.slice(0, 10));
  });
  // Sort days
  const sorted = Array.from(days).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let prev: Date | null = null;
  for (let i = 0; i < sorted.length; i++) {
    const d = new Date(sorted[i]);
    if (prev) {
      const diff = (d.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    if (currentStreak > longestStreak) longestStreak = currentStreak;
    prev = d;
  }
  // Check if today is in the streak
  const todayStr = new Date().toISOString().slice(0, 10);
  if (!days.has(todayStr)) currentStreak = 0;
  return { currentStreak, longestStreak };
}

/**
 * App root component
 */
const App = () => {
  // --- State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [showModal, setShowModal] = useState(false);
  const [snackbar, setSnackbar] = useState<{task: Task, timer: number} | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const prevTasksRef = useRef<Task[]>([]);
  const [reminderDismissedIds, setReminderDismissedIds] = useState<number[]>([]);

  // --- Persistence: Load tasks from localStorage on mount ---
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  // --- Persistence: Save tasks to localStorage on change ---
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  /**
   * Add a new task
   */
  const addTask = useCallback((name: string, description: string, dueDate?: string) => {
    const newTask: Task = {
      id: Date.now(),
      name,
      description,
      completed: false,
      dueDate,
    };
    setTasks(prev => [...prev, newTask]);
    setShowModal(false); // Close modal after adding
  }, []);

  /**
   * Toggle completion status of a task. Triggers confetti if marking as complete.
   */
  const toggleTaskCompletion = useCallback((id: number) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === id) {
          // Only trigger confetti if marking as complete
          if (!task.completed) {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#1976d2', '#64b5f6', '#43e97b', '#f9d423', '#ff4e50'],
            });
          }
          return { ...task, completed: !task.completed };
        }
        return task;
      });
      return updatedTasks;
    });
  }, []);

  /**
   * Undo delete logic: restores a deleted task if undo is clicked in time.
   */
  const handleUndo = useCallback(() => {
    if (snackbar) {
      setTasks(prev => [snackbar.task, ...prev]);
      clearTimeout(snackbar.timer);
      setSnackbar(null);
      setPendingDeleteId(null);
    }
  }, [snackbar]);

  /**
   * Delete a task, with undo option via snackbar.
   */
  const deleteTask = useCallback((id: number) => {
    setTasks(prevTasks => {
      const taskToDelete = prevTasks.find(t => t.id === id);
      if (!taskToDelete) return prevTasks;
      const newTasks = prevTasks.filter(task => task.id !== id);
      setPendingDeleteId(id);
      // Set up snackbar and timer
      const timer = window.setTimeout(() => {
        setSnackbar(null);
        setPendingDeleteId(null);
      }, UNDO_TIMEOUT);
      setSnackbar({ task: taskToDelete, timer });
      return newTasks;
    });
  }, []);

  // Remove task permanently if not undone (handled by timer)
  useEffect(() => {
    // If a new task is deleted before previous undo expires, clear previous timer
    return () => {
      if (snackbar) clearTimeout(snackbar.timer);
    };
  }, [snackbar]);

  // --- Task Filtering, Searching, and Sorting ---
  /**
   * Returns tasks filtered by search and filter, and sorted by due date/urgency.
   */
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        const matchesSearch =
          task.name.toLowerCase().includes(search.toLowerCase()) ||
          task.description.toLowerCase().includes(search.toLowerCase());
        if (!matchesSearch) return false;
        if (filter === 'completed') {
          return task.completed;
        }
        if (filter === 'incomplete') {
          return !task.completed;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by due date: overdue/soonest first, then no due date, then by id (creation)
        if (a.dueDate && b.dueDate) {
          const aTime = new Date(a.dueDate).setHours(23,59,59,999);
          const bTime = new Date(b.dueDate).setHours(23,59,59,999);
          return aTime - bTime;
        }
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        return b.id - a.id; // newest first
      });
  }, [tasks, search, filter]);

  // --- Analytics ---
  const totalTasks = filteredTasks.length;
  const completedTasks = useMemo(() => filteredTasks.filter(task => task.completed).length, [filteredTasks]);
  const incompleteTasks = totalTasks - completedTasks;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const dueToday = useMemo(() => filteredTasks.filter(t => t.dueDate && !t.completed && new Date(t.dueDate).toDateString() === new Date().toDateString()).length, [filteredTasks]);
  const overdue = useMemo(() => filteredTasks.filter(t => t.dueDate && !t.completed && new Date(t.dueDate).setHours(23,59,59,999) < Date.now()).length, [filteredTasks]);
  const { currentStreak, longestStreak } = useMemo(() => getStreaks(filteredTasks), [filteredTasks]);

  // --- Reminders: Find soonest due (incomplete, not dismissed) task within 24h ---
  const soonestDueTask = useMemo(() => {
    const now = new Date();
    return tasks
      .filter(
        t =>
          !t.completed &&
          t.dueDate &&
          !reminderDismissedIds.includes(t.id) &&
          new Date(t.dueDate).setHours(23, 59, 59, 999) - now.getTime() <= 24 * 60 * 60 * 1000 &&
          new Date(t.dueDate).setHours(23, 59, 59, 999) - now.getTime() > 0
      )
      .sort((a, b) =>
        new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
      )[0];
  }, [tasks, reminderDismissedIds]);

  /**
   * Dismiss the reminder snackbar for the soonest due task.
   */
  const handleDismissReminder = useCallback(() => {
    if (soonestDueTask) {
      setReminderDismissedIds(ids => [...ids, soonestDueTask.id]);
    }
  }, [soonestDueTask]);

  /**
   * Mark the soonest due task as complete from the reminder snackbar.
   */
  const handleMarkCompleteReminder = useCallback(() => {
    if (soonestDueTask) {
      toggleTaskCompletion(soonestDueTask.id);
      setReminderDismissedIds(ids => [...ids, soonestDueTask.id]);
    }
  }, [soonestDueTask, toggleTaskCompletion]);

  // --- Render ---
  return (
    <div className={styles.appContainer}>
      <Header />
      <main className={styles.mainContent} aria-label="Main content">
        {/* Dashboard */}
        <div className={styles.dashboard} aria-label="Task analytics dashboard">
          <div className={styles.dashboardItem}>
            <span className={styles.dashboardLabel}>Total Tasks</span>
            <span className={styles.dashboardValue}>{totalTasks}</span>
          </div>
          <div className={styles.dashboardItem}>
            <span className={styles.dashboardLabel}>Completed</span>
            <span className={styles.dashboardValue}>{completedTasks}</span>
          </div>
          <div className={styles.dashboardItem}>
            <span className={styles.dashboardLabel}>Incomplete</span>
            <span className={styles.dashboardValue}>{incompleteTasks}</span>
          </div>
          <div className={styles.dashboardItem}>
            <span className={styles.dashboardLabel}>Completion Rate</span>
            <span className={styles.dashboardValue}>{completionRate}%</span>
          </div>
          <div className={styles.dashboardItem}>
            <span className={styles.dashboardLabel}>Current Streak</span>
            <span className={styles.dashboardValue}>{currentStreak} day{currentStreak === 1 ? '' : 's'}</span>
          </div>
          <div className={styles.dashboardItem}>
            <span className={styles.dashboardLabel}>Longest Streak</span>
            <span className={styles.dashboardValue}>{longestStreak} day{longestStreak === 1 ? '' : 's'}</span>
          </div>
          <div className={styles.dashboardItem}>
            <span className={styles.dashboardLabel}>Due Today</span>
            <span className={styles.dashboardValue}>{dueToday}</span>
          </div>
          <div className={styles.dashboardItem}>
            <span className={styles.dashboardLabel}>Overdue</span>
            <span className={styles.dashboardValue}>{overdue}</span>
          </div>
        </div>
        {/* Animated Progress Bar */}
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${completionRate}%` }}
            aria-valuenow={completionRate}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
            aria-label="Task completion progress bar"
          ></div>
          <span className={styles.progressText}>{completionRate}% Complete</span>
        </div>
        {/* Search Bar */}
        <div className={styles.searchBarContainer}>
          <input
            className={styles.searchBar}
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search tasks"
          />
        </div>
        {/* <TaskForm onAddTask={addTask} /> */}
        <FilterControls currentFilter={filter} onSetFilter={setFilter} />
        <TaskList
          tasks={filteredTasks}
          onToggleComplete={toggleTaskCompletion}
          onDelete={deleteTask}
        />
      </main>
      {/* Floating Action Button */}
      <button className={styles.fab} onClick={() => setShowModal(true)} aria-label="Add Task">
        +
      </button>
      {/* Modal for Add Task */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)} aria-modal="true" role="dialog">
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setShowModal(false)} aria-label="Close">&times;</button>
            <TaskForm onAddTask={addTask} />
          </div>
        </div>
      )}
      {/* Snackbar for Undo Delete */}
      {snackbar && (
        <div className={styles.snackbar} role="status" aria-live="polite">
          Task deleted
          <button className={styles.undoBtn} onClick={handleUndo} autoFocus>Undo</button>
        </div>
      )}
      {/* Snackbar for Reminder */}
      {soonestDueTask && (
        <div className={styles.reminderSnackbar} role="status" aria-live="polite">
          <span>
            <b>Reminder:</b> "{soonestDueTask.name}" is due soon!
          </span>
          <button className={styles.reminderActionBtn} onClick={handleMarkCompleteReminder}>Mark as Complete</button>
          <button className={styles.reminderActionBtn} onClick={handleDismissReminder}>Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default App;