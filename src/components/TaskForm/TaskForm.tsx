import React from 'react';
/**
 * TaskForm component for adding a new task, with name, description, and due date.
 */
import { useState } from 'react';
import styles from './TaskForm.module.css';
import appStyles from '../../App.module.css';

interface TaskFormProps {
  onAddTask: (name: string, description: string, dueDate?: string) => void;
}

const TaskForm = ({ onAddTask }: TaskFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  /**
   * Handle form submission and pass data to parent.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddTask(name, description, dueDate || undefined);
      setName('');
      setDescription('');
      setDueDate('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} aria-label="Add new task form">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Task Name"
        className={styles.input}
        required
        aria-label="Task name"
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Task Description"
        className={styles.textarea}
        aria-label="Task description"
      />
      <input
        type="date"
        value={dueDate}
        onChange={e => setDueDate(e.target.value)}
        className={styles.input}
        style={{ marginBottom: '1rem' }}
        aria-label="Due date"
      />
      <button type="submit" className={appStyles.glowButton} aria-label="Add task">Add Task</button>
    </form>
  );
};

export default React.memo(TaskForm);