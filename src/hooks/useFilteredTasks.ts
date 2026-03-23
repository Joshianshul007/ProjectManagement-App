import { useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore';

export const useFilteredTasks = () => {
  const tasks = useTaskStore(state => state.tasks);
  const filters = useTaskStore(state => state.filters);

  return useMemo(() => {
    return tasks.filter((task) => {
      // 1. Filter by status sequentially allowing multi-select intersections
      if (filters.statuses && filters.statuses.length > 0 && !filters.statuses.includes(task.status)) {
        return false;
      }
      
      // 2. Filter by priority
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }
      
      // 3. Filter by assignee (simple text match)
      if (filters.assignee) {
        const query = filters.assignee.toLowerCase();
        if (!task.assignee.name.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // 4. Filter by date bounding limits explicitly
      if (filters.dateRange) {
        const taskDate = new Date(task.dueDate).getTime();
        if (filters.dateRange.start) {
          const startLimit = new Date(filters.dateRange.start).getTime();
          if (taskDate < startLimit) return false;
        }
        if (filters.dateRange.end) {
          const endLimit = new Date(filters.dateRange.end).getTime();
          // Add end of day natively
          if (taskDate > endLimit + 86400000) return false;
        }
      }
      
      return true;
    });
  }, [tasks, filters]);
};
