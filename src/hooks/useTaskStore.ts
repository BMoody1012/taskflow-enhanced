
import { useState, useEffect } from 'react';
import { Task, Settings, Language, Theme, RecurrenceType } from '../types';
import { addDays, addWeeks, addMonths } from 'date-fns';

const STORAGE_KEY_TASKS = 'taskflow_tasks';
const STORAGE_KEY_SETTINGS = 'taskflow_settings';

const DEFAULT_SETTINGS: Settings = {
  language: 'en',
  theme: 'light',
  reminderSound: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' // Default beep
};

export function useTaskStore() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TASKS);
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const getNextOccurrence = (dueDate: string, recurrence: RecurrenceType): string => {
    const date = new Date(dueDate);
    switch (recurrence) {
      case 'daily': return addDays(date, 1).toISOString();
      case 'weekly': return addWeeks(date, 1).toISOString();
      case 'monthly': return addMonths(date, 1).toISOString();
      default: return dueDate;
    }
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'reminderTriggered'>) => {
    const newTask: Task = {
      ...task,
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      reminderTriggered: false
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const taskIndex = prev.findIndex(t => t.id === id);
      if (taskIndex === -1) return prev;

      const task = prev[taskIndex];
      const newTasks = [...prev];
      newTasks[taskIndex] = { ...task, ...updates };

      // Handle recurrence when marking as done
      if (updates.status === 'done' && task.status !== 'done' && task.recurrence && task.recurrence !== 'none') {
        const nextDate = getNextOccurrence(task.dueDate, task.recurrence);
        const nextTask: Task = {
          title: task.title,
          owner: task.owner,
          dueDate: nextDate,
          recurrence: task.recurrence,
          status: 'todo',
          id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
          createdAt: new Date().toISOString(),
          reminderTriggered: false,
          comments: []
        };
        newTasks.push(nextTask);
      }

      return newTasks;
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const restoreBackup = (newTasks: Task[], newSettings: Settings) => {
    setTasks(newTasks);
    setSettings(newSettings);
  };

  return {
    tasks,
    settings,
    addTask,
    updateTask,
    deleteTask,
    updateSettings,
    restoreBackup
  };
}
