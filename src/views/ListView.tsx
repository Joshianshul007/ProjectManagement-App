import { useState, useRef, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { TaskStatus } from '../types/task';

type SortColumn = 'title' | 'priority' | 'dueDate' | null;
type SortDirection = 'asc' | 'desc';

// Virtual Scrolling Configuration
const ROW_HEIGHT = 76; // Exact fixed height per row to prevent layout shifts
const BUFFER_ROWS = 5; // Rows to render out-of-view above and below

export const ListView = () => {
  const { getFilteredTasks, updateTaskStatus } = useTaskStore();
  const tasks = getFilteredTasks();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sorting State
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Virtual Scrolling State
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(800); // Sane default before mount

  // Setup Resize Observer for precise container height tracking
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initial height
    setContainerHeight(containerRef.current.clientHeight);
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const handleScroll = () => {
    // Request animation frame is not strictly necessary in React 18+ due to automatic batching,
    // but ensures layout updates synchronize with browser painting for completely smooth sailing.
    requestAnimationFrame(() => {
      if (containerRef.current) {
        setScrollTop(containerRef.current.scrollTop);
      }
    });
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    // Optionally reset scroll to top on sort change
    if (containerRef.current) containerRef.current.scrollTop = 0;
  };

  const priorityWeight = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const modifier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortColumn) {
      case 'title':
        return a.title.localeCompare(b.title) * modifier;
      case 'priority':
        return (priorityWeight[a.priority] - priorityWeight[b.priority]) * modifier;
      case 'dueDate':
        return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * modifier;
      default:
        return 0;
    }
  });

  // --- Virtual Scrolling Core Logic ---
  const totalTasks = sortedTasks.length;
  
  // 1. Calculate the raw visible window indices
  const rawStartIndex = Math.floor(scrollTop / ROW_HEIGHT);
  const rawEndIndex = Math.floor((scrollTop + containerHeight) / ROW_HEIGHT);
  
  // 2. Apply dynamic buffers to prevent visual tearing when scrolling fast
  const startIndex = Math.max(0, rawStartIndex - BUFFER_ROWS);
  const endIndex = Math.min(totalTasks - 1, rawEndIndex + BUFFER_ROWS);
  
  // 3. Slice exactly what needs to be rendered natively
  const visibleTasks = sortedTasks.slice(startIndex, endIndex + 1);
  
  // 4. Calculate spacer blocks (empty UI space) above and below the rendered items
  const topSpacerHeight = startIndex * ROW_HEIGHT;
  const bottomSpacerHeight = Math.max(0, (totalTasks - 1 - endIndex) * ROW_HEIGHT);


  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'critical': 
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">Critical</span>;
      case 'high': 
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 uppercase tracking-wider">High</span>;
      case 'medium': 
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">Medium</span>;
      case 'low': 
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 uppercase tracking-wider">Low</span>;
      default: 
        return null;
    }
  };

  const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' }
  ];

  const SortIcon = ({ column }: { column: NonNullable<SortColumn> }) => {
    if (sortColumn !== column) {
      return (
        <svg className="w-3.5 h-3.5 ml-1.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-3.5 h-3.5 ml-1.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3.5 h-3.5 ml-1.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const SortableHeader = ({ label, column }: { label: string, column: NonNullable<SortColumn> }) => (
    <th 
      scope="col" 
      onClick={() => handleSort(column)}
      className="px-6 py-4 text-xs tracking-wider w-max cursor-pointer group select-none transition-colors hover:bg-gray-100 h-14"
    >
      <div className="flex items-center">
        <span className={`font-bold uppercase ${sortColumn === column ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'}`}>
          {label}
        </span>
        <SortIcon column={column} />
      </div>
    </th>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto h-full flex flex-col pb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">List View (Virtual Scroll)</h2>
        <span className="bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
          {totalTasks} tasks rendering smoothly
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col max-h-[calc(100vh-140px)]">
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar w-full transform-gpu"
        >
          <table className="min-w-full divide-y divide-gray-200 text-left table-fixed">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm border-b border-gray-200">
              <tr>
                <SortableHeader label="Title" column="title" />
                <SortableHeader label="Priority" column="priority" />
                <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider h-14">Assignee</th>
                <SortableHeader label="Due Date" column="dueDate" />
                <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider h-14">Status</th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-100">
              {/* Intelligent Top Spacer Row: forces height down to simulate scrolled past objects */}
              {topSpacerHeight > 0 && (
                <tr style={{ height: topSpacerHeight }}>
                  <td colSpan={5} className="p-0 border-0 m-0"></td>
                </tr>
              )}

              {visibleTasks.map(task => {
                const dueDate = new Date(task.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                const isOverdue = dueDate < today && task.status !== 'done';

                return (
                  <tr key={task.id} style={{ height: ROW_HEIGHT }} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 overflow-hidden text-ellipsis whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">{task.title}</span>
                        <span className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{task.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-800 border-2 border-white ring-1 ring-indigo-200 flex items-center justify-center text-[10px] font-black shadow-sm" title={task.assignee.name}>
                          {task.assignee.initials}
                        </div>
                        <span className="text-sm text-gray-600 font-medium truncate">{task.assignee.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden">
                      <span className={`text-sm font-semibold px-2.5 py-1 rounded flex items-center gap-1.5 w-max
                        ${isOverdue ? 'bg-red-50 text-red-700 outline outline-1 outline-red-200' : 'text-gray-600'}`}>
                        {isOverdue && <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        {dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden">
                      <div className="relative inline-block w-full max-w-[150px]">
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                          className={`block w-full pl-3 pr-8 py-2 text-sm font-bold rounded-lg appearance-none cursor-pointer border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                            ${task.status === 'done' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 
                              task.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 
                              task.status === 'review' ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' : 
                              'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}
                          `}
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value} className="bg-white text-gray-900 font-medium">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <svg className="fill-current outline-none h-4 w-4 opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {/* Intelligent Bottom Spacer Row: anchors the total height to maintain native scrollbar size */}
              {bottomSpacerHeight > 0 && (
                <tr style={{ height: bottomSpacerHeight }}>
                  <td colSpan={5} className="p-0 border-0 m-0"></td>
                </tr>
              )}

              {totalTasks === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      <p className="text-sm font-medium">No tasks found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info area */}
        <div className="bg-gray-50/80 border-t border-gray-200 px-6 py-3 text-sm text-gray-500 font-medium flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] z-20">
          <span>Showing all {totalTasks} tasks</span>
        </div>
      </div>
    </div>
  );
};
