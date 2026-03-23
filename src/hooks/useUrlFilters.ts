import { useEffect, useRef } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { TaskStatus, TaskPriority } from '../types/task';

export const useUrlFilters = () => {
  const { filters, setFilters } = useTaskStore();
  const isInitialized = useRef(false);

  // Restore state from URL exactly once on application mount gracefully mapping backwards
  useEffect(() => {
    if (isInitialized.current) return;
    
    const params = new URLSearchParams(window.location.search);
    const newFilters: any = {};
    
    const statusesStr = params.get('statuses');
    if (statusesStr) {
      newFilters.statuses = statusesStr.split(',').filter(Boolean) as TaskStatus[];
    }
    
    const priority = params.get('priority');
    if (priority) newFilters.priority = priority as TaskPriority;
    
    const assignee = params.get('assignee');
    if (assignee) newFilters.assignee = assignee;
    
    const start = params.get('start');
    const end = params.get('end');
    if (start || end) {
      newFilters.dateRange = { 
         start: start || '', 
         end: end || '' 
      };
    }
    
    if (Object.keys(newFilters).length > 0) {
       setFilters(newFilters);
    }
    
    isInitialized.current = true;
  }, [setFilters]);

  // Sequentially track filters updating search parameters fluidly ensuring browser history matches UI smoothly
  useEffect(() => {
    if (!isInitialized.current) return;

    const params = new URLSearchParams();
    
    if (filters.statuses && filters.statuses.length > 0) {
      params.set('statuses', filters.statuses.join(','));
    }
    if (filters.priority) {
      params.set('priority', filters.priority);
    }
    if (filters.assignee) {
      params.set('assignee', filters.assignee);
    }
    if (filters.dateRange) {
      if (filters.dateRange.start) params.set('start', filters.dateRange.start);
      if (filters.dateRange.end) params.set('end', filters.dateRange.end);
    }

    const queryStr = params.toString();
    const newUrl = `${window.location.pathname}${queryStr ? '?' + queryStr : ''}`;
    
    // Explicitly pushing via replaceState to circumvent destroying the "back arrow" functionally natively
    window.history.replaceState({}, '', newUrl);
  }, [filters]);
};
