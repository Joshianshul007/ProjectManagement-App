import { useState, useRef, useEffect, useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useFilteredTasks } from '../hooks/useFilteredTasks';
import { ListViewRow } from '../components/ListViewRow';

type SortColumn = 'title' | 'priority' | 'dueDate' | null;
type SortDirection = 'asc' | 'desc';

const SortIcon = ({ column, sortColumn, sortDirection }: { column: NonNullable<SortColumn>, sortColumn: SortColumn, sortDirection: SortDirection }) => {
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

const SortableHeader = ({ label, column, width = '', sortColumn, sortDirection, onSort }: { label: string, column: NonNullable<SortColumn>, width?: string, sortColumn: SortColumn, sortDirection: SortDirection, onSort: (col: SortColumn) => void }) => (
  <th 
    scope="col" 
    onClick={() => onSort(column)}
    className={`px-6 py-4 text-xs tracking-wider cursor-pointer group select-none transition-colors hover:bg-gray-100 h-14 ${width}`}
  >
    <div className="flex items-center">
      <span className={`font-bold uppercase ${sortColumn === column ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'}`}>
        {label}
      </span>
      <SortIcon column={column} sortColumn={sortColumn} sortDirection={sortDirection} />
    </div>
  </th>
);

// Virtual Scrolling Configuration
const ROW_HEIGHT = 76; // Exact fixed height per row to prevent layout shifts
const BUFFER_ROWS = 5; // Rows to render out-of-view above and below

export const ListView = () => {
  const updateTaskStatus = useTaskStore(state => state.updateTaskStatus);
  const setFilters = useTaskStore(state => state.setFilters);
  const tasks = useFilteredTasks();
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

  // 1. Apply efficient memoized multi-dimensional layout sorting dynamically
  const sortedTasks = useMemo(() => {
    if (!sortColumn) return tasks;

    const processedTasks = [...tasks];
    const modifier = sortDirection === 'asc' ? 1 : -1;
    
    const priorityWeight = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };

    return processedTasks.sort((a, b) => {
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
  }, [tasks, sortColumn, sortDirection]);

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

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto h-full flex flex-col pb-10">
      <div className="flex justify-between items-center mb-6 px-2 md:px-0">
        <h2 className="text-2xl font-bold text-gray-800">List View</h2>
        <span className="bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
          {totalTasks} tasks rendering smoothly
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col max-h-[calc(100vh-140px)]">
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="overflow-y-auto overflow-x-auto flex-1 custom-scrollbar w-full transform-gpu"
        >
          <table className="min-w-full divide-y divide-gray-200 text-left table-fixed">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm border-b border-gray-200">
              <tr>
                <SortableHeader label="Title" column="title" width="w-[35%]" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label="Priority" column="priority" width="w-[15%]" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                <th scope="col" className="w-[20%] px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider h-14">Assignee</th>
                <SortableHeader label="Due Date" column="dueDate" width="w-[15%]" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} />
                <th scope="col" className="w-[15%] px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider h-14">Status</th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-100">
              {/* Intelligent Top Spacer Row: forces height down to simulate scrolled past objects */}
              {topSpacerHeight > 0 && (
                <tr style={{ height: topSpacerHeight }}>
                  <td colSpan={5} className="p-0 border-0 m-0"></td>
                </tr>
              )}

              {visibleTasks.map(task => (
                <ListViewRow 
                  key={task.id} 
                  task={task} 
                  rowHeight={ROW_HEIGHT} 
                  onUpdateStatus={updateTaskStatus} 
                />
              ))}
              
              {/* Intelligent Bottom Spacer Row: anchors the total height to maintain native scrollbar size */}
              {bottomSpacerHeight > 0 && (
                <tr style={{ height: bottomSpacerHeight }}>
                  <td colSpan={5} className="p-0 border-0 m-0"></td>
                </tr>
              )}

              {totalTasks === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500 bg-gray-50/50">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      <p className="text-sm font-medium mb-4">No tasks found matching your filters.</p>
                      <button 
                        onClick={() => setFilters({ statuses: [], priority: null, assignee: '', dateRange: null })}
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        Clear All Filters
                      </button>
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
