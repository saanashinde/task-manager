import React from 'react';
/**
 * TaskItem component displays a single task, its details, due date, and actions.
 */
import type { Task } from '../../types';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

/**
 * Returns a string describing the due status/countdown for a task.
 */
function getDueStatus(dueDate?: string) {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.setHours(23,59,59,999) - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 0) return `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  if (diffDays === 0) return 'Due today';
  return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`;
}

const TaskItem = ({ task, onToggleComplete, onDelete }: TaskItemProps) => {
  const dueStatus = getDueStatus(task.dueDate);
  const isOverdue = dueStatus && dueStatus.startsWith('Overdue');
  return (
    <li
      className={`${styles.taskItem} ${task.completed ? styles.completed : ''} ${isOverdue ? styles.overdue : ''}`}
      aria-label={`Task: ${task.name}${task.completed ? ', completed' : ''}${isOverdue ? ', overdue' : ''}`}
    >
      <div className={styles.taskDetails}>
        <h3>{task.name}</h3>
        <p>{task.description}</p>
        {task.dueDate && (
          <div className={styles.dueDateRow}>
            <span className={styles.dueDateLabel}>Due: {task.dueDate}</span>
            <span className={styles.dueStatus + (isOverdue ? ' ' + styles.overdueText : '')}>{dueStatus}</span>
          </div>
        )}
      </div>
      <div className={styles.taskActions}>
        <button
          onClick={() => onToggleComplete(task.id)}
          className={styles.completeButton}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed ? 'Undo' : 'Complete'}
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className={styles.deleteButton}
          aria-label="Delete task"
        >
          Delete
        </button>
      </div>
    </li>
  );
};

export default React.memo(TaskItem);