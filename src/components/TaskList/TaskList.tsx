import React from 'react';
/**
 * TaskList component renders a list of TaskItem components with animated transitions.
 */
import type { Task } from '../../types';
import TaskItem from '../TaskItem/TaskItem';
import styles from './TaskList.module.css';
import { useEffect, useRef, useState } from 'react';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

const TaskList = ({ tasks, onToggleComplete, onDelete }: TaskListProps) => {
  // Track which tasks are being removed for exit animation
  const [removingIds, setRemovingIds] = useState<number[]>([]);
  const prevTasksRef = useRef<Task[]>(tasks);

  useEffect(() => {
    // Detect removed tasks for exit animation
    const prevIds = prevTasksRef.current.map(t => t.id);
    const currentIds = tasks.map(t => t.id);
    const removed = prevIds.filter(id => !currentIds.includes(id));
    if (removed.length > 0) {
      setRemovingIds(ids => [...ids, ...removed]);
      // Remove from state after animation
      setTimeout(() => {
        setRemovingIds(ids => ids.filter(id => !removed.includes(id)));
      }, 400);
    }
    prevTasksRef.current = tasks;
  }, [tasks]);

  if (tasks.length === 0) {
    return <p className={styles.noTasks}>No tasks to show.</p>;
  }

  return (
    <ul className={styles.taskList} aria-label="Task list">
      {tasks.map(task => {
        const isRemoving = removingIds.includes(task.id);
        return (
          <li
            key={task.id}
            className={
              isRemoving
                ? `${styles.taskItem} ${styles.taskExit} ${styles.taskExitActive}`
                : `${styles.taskItem} ${styles.taskEnter} ${styles.taskEnterActive}`
            }
          >
            <TaskItem
              task={task}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
            />
          </li>
        );
      })}
    </ul>
  );
};

export default React.memo(TaskList);