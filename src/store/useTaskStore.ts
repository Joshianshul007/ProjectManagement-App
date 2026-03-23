import { create } from 'zustand';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { mockTasks } from '../data/mockTasks';

export interface TaskFilters {
  statuses?: TaskStatus[];
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
  draggingTaskId: string | null;
  dropTargetStatus: TaskStatus | null;
  setCurrentView: (view: ViewMode) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  startUserSimulation: () => void;
  setDraggingTask: (taskId: string | null) => void;
  setDropTargetStatus: (status: TaskStatus | null) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: mockTasks, // Initialize seamlessly with our mock test data
  filters: {},
  currentView: 'kanban',
  activeUsers: LIVE_USERS,
  simulationStarted: false,
  draggingTaskId: null,
  dropTargetStatus: null,
  
  setCurrentView: (view: ViewMode) => set({ currentView: view }),
  
  setDraggingTask: (taskId: string | null) => set({ draggingTaskId: taskId }),
  setDropTargetStatus: (status: TaskStatus | null) => set({ dropTargetStatus: status }),
  
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => set((state) => ({
    tasks: state.tasks.map((task) => 
      task.id === taskId ? { ...task, status: newStatus } : task
    )
  })),

  setFilters: (newFilters: Partial<TaskFilters>) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  startUserSimulation: () => {
    if (get().simulationStarted) return;
    set({ simulationStarted: true });

    setInterval(() => {
      set((state) => {
         const { activeUsers, tasks } = state;
         const numToMove = Math.floor(Math.random() * 2) + 1;
         const updatedUsers = [...activeUsers];
         
         if (tasks.length === 0) return { activeUsers };

         for (let i=0; i<numToMove; i++) {
           const randomUserIdx = Math.floor(Math.random() * updatedUsers.length);
           // Restrict random movement to front tasks so they stay on screen natively
           const maxTarget = Math.min(25, tasks.length);
           const randomTask = tasks[Math.floor(Math.random() * maxTarget)];
           
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
