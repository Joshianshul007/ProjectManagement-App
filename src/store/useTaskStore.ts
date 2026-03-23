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

export type ViewMode = 'kanban' | 'list' | 'timeline';

export interface ActiveUser {
  id: string;
  name: string;
  initials: string;
  color: string;
  currentTaskId: string | null;
}

const LIVE_USERS: ActiveUser[] = [
  { id: 'u1', name: 'Sarah Chen', initials: 'SC', color: '#ec4899', currentTaskId: null },
  { id: 'u2', name: 'Mike Ross', initials: 'MR', color: '#8b5cf6', currentTaskId: null },
  { id: 'u3', name: 'Alex Kim', initials: 'AK', color: '#10b981', currentTaskId: null },
  { id: 'u4', name: 'Emma Watson', initials: 'EW', color: '#f59e0b', currentTaskId: null }
];

interface TaskState {
  tasks: Task[];
  filters: TaskFilters;
  currentView: ViewMode;
  activeUsers: ActiveUser[];
  simulationStarted: boolean;
  setCurrentView: (view: ViewMode) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  getFilteredTasks: () => Task[];
  startUserSimulation: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: mockTasks, // Initialize seamlessly with our mock test data
  filters: {},
  currentView: 'kanban',
  activeUsers: LIVE_USERS,
  simulationStarted: false,
  
  setCurrentView: (view: ViewMode) => set({ currentView: view }),
  
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
  },

  startUserSimulation: () => {
    if (get().simulationStarted) return;
    set({ simulationStarted: true });

    setInterval(() => {
      set((state) => {
         const { activeUsers } = state;
         const numToMove = Math.floor(Math.random() * 2) + 1;
         const updatedUsers = [...activeUsers];
         
         const visibleTasks = state.getFilteredTasks();
         if (visibleTasks.length === 0) return { activeUsers };

         for (let i=0; i<numToMove; i++) {
           const randomUserIdx = Math.floor(Math.random() * updatedUsers.length);
           // Restrict random movement to front tasks so they stay on screen
           const maxTarget = Math.min(25, visibleTasks.length);
           const randomTask = visibleTasks[Math.floor(Math.random() * maxTarget)];
           
           updatedUsers[randomUserIdx] = {
              ...updatedUsers[randomUserIdx],
              currentTaskId: randomTask.id
           };
         }
         return { activeUsers: updatedUsers };
      });
    }, 4000); // Animate movement every 4 seconds
  }
}));
