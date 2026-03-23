import { create } from 'zustand';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { mockTasks } from '../data/mockTasks';

export interface TaskFilters {
  status?: TaskStatus | null;
  priority?: TaskPriority | null;
  assignee?: string;
  dateRange?: {
    start: string; // ISO string
    end: string;   // ISO string
  } | null;
}

interface TaskState {
  tasks: Task[];
  filters: TaskFilters;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  getFilteredTasks: () => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: mockTasks, // Initialize seamlessly with our mock test data
  filters: {},
  
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => set((state) => ({
    tasks: state.tasks.map((task) => 
      task.id === taskId ? { ...task, status: newStatus } : task
    )
  })),

  setFilters: (newFilters: Partial<TaskFilters>) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  // Derived state function to retrieve evaluated results dynamically
  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter((task) => {
      // 1. Filter by status
      if (filters.status && task.status !== filters.status) {
        return false;
      }
      
      // 2. Filter by priority
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }
      
      // 3. Filter by assignee name or initials
      if (filters.assignee && filters.assignee.trim() !== '') {
        const query = filters.assignee.toLowerCase();
        const assigneeMatch = 
          task.assignee.name.toLowerCase().includes(query) || 
          task.assignee.initials.toLowerCase().includes(query);
          
        if (!assigneeMatch) {
          return false;
        }
      }
      
      // 4. Filter by Due Date Range
      if (filters.dateRange) {
        const taskDate = new Date(task.dueDate).getTime();
        const startDate = new Date(filters.dateRange.start).getTime();
        const endDate = new Date(filters.dateRange.end).getTime();
        
        if (taskDate < startDate || taskDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  }
}));
