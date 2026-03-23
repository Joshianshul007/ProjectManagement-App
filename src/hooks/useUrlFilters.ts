import { useEffect, useRef, useCallback } from 'react';
import { useTaskStore, ViewMode, TaskFilters } from '../store/useTaskStore';
import { TaskStatus, TaskPriority } from '../types/task';

export const useUrlFilters = () => {
  const { filters, setFilters, currentView, setCurrentView } = useTaskStore();
  const isInitialized = useRef(false);
  const isPopStateNavigating = useRef(false);

  // Extract pure URL decoding logic into highly reusable bound reference natively
  const parseUrlAndSetState = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    
    // 1. Restore View Mode if explicit
    const viewParam = params.get('view') as ViewMode;
    if (viewParam && ['kanban', 'list', 'timeline'].includes(viewParam)) {
      setCurrentView(viewParam);
    }

    // 2. Restore filter hashes seamlessly overwriting null domains globally
    const newFilters: Partial<TaskFilters> = {};
    
    const statusesStr = params.get('statuses');
    newFilters.statuses = statusesStr ? statusesStr.split(',').filter(Boolean) as TaskStatus[] : [];
    
    const priority = params.get('priority');
    newFilters.priority = priority ? (priority as TaskPriority) : null;
    
    const assignee = params.get('assignee');
    newFilters.assignee = assignee || '';
    
    const start = params.get('start');
    const end = params.get('end');
    if (start || end) {
      newFilters.dateRange = { start: start || '', end: end || '' };
    } else {
      newFilters.dateRange = null;
    }
    
    setFilters(newFilters);
  }, [setCurrentView, setFilters]);

  // Restore state from URL exactly once on application mount gracefully mapping backwards
  useEffect(() => {
    if (!isInitialized.current) {
    
      parseUrlAndSetState();
      isInitialized.current = true;
    }

    // Capture native Back/Forward Browser navigation seamlessly bypassing cyclical syncs
    const handlePopState = () => {
      isPopStateNavigating.current = true;
      parseUrlAndSetState();
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [parseUrlAndSetState]);

  // Sequentially track filters updating search parameters fluidly ensuring browser history matches UI smoothly
  useEffect(() => {
    if (!isInitialized.current) return;

    if (isPopStateNavigating.current) {
        // Suppress `pushState` logic if we JUST inherited state natively from pressing back!
        isPopStateNavigating.current = false;
        return; 
    }

    const params = new URLSearchParams();
    
    // Bind routing views tightly into the URL base natively
    if (currentView !== 'kanban') {
      params.set('view', currentView);
    }

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
    
    // Explicitly pushing via pushState creating native historic crumbs tracking layouts
    window.history.pushState({}, '', newUrl);
  }, [filters, currentView]);
};
