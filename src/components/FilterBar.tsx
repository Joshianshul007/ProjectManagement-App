import { useTaskStore } from '../store/useTaskStore';
import { TaskStatus, TaskPriority } from '../types/task';

export const FilterBar = () => {
  const { filters, setFilters } = useTaskStore();

  const activeStatuses = filters.statuses || [];
  
  const toggleStatus = (status: TaskStatus) => {
    const newStatuses = activeStatuses.includes(status)
      ? activeStatuses.filter(s => s !== status)
      : [...activeStatuses, status];
    setFilters({ statuses: newStatuses });
  };

  const clearFilters = () => {
    setFilters({ statuses: [], priority: null, assignee: '', dateRange: null });
  };

  const hasFilters = activeStatuses.length > 0 || filters.priority || filters.assignee || (filters.dateRange && (filters.dateRange.start || filters.dateRange.end));

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center gap-6 flex-wrap text-sm relative z-30 shadow-sm transition-all overflow-x-auto custom-scrollbar">
      
      {/* Status multi-select seamlessly constructed as toggle pills */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-semibold text-gray-700 tracking-tight">Status:</span>
        <div className="flex gap-1 border border-gray-200/80 rounded-lg overflow-hidden p-0.5 bg-gray-50/50 shadow-inner">
           {(['todo', 'in-progress', 'review', 'done'] as TaskStatus[]).map(status => (
             <button 
               key={status} 
               onClick={() => toggleStatus(status)}
               className={`px-3 py-1 text-[11px] font-extrabold rounded-md capitalize transition-all duration-200 
                ${activeStatuses.includes(status) 
                  ? 'bg-blue-100 text-blue-800 shadow-sm border border-blue-200 ring-1 ring-blue-300' 
                  : 'text-gray-500 hover:bg-gray-200/50 border border-transparent'}`}
             >
               {status}
             </button>
           ))}
        </div>
      </div>

      {/* Priority Dropdown Select tightly bounded native */}
      <div className="flex items-center gap-2 border-l border-gray-200 pl-6 flex-shrink-0">
        <span className="font-semibold text-gray-700 tracking-tight">Priority:</span>
        <select 
           value={filters.priority || ''} 
           onChange={(e) => setFilters({ priority: (e.target.value as TaskPriority) || null })}
           className="bg-gray-50 hover:bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer"
        >
           <option value="">All Priorities</option>
           <option value="critical">Critical</option>
           <option value="high">High</option>
           <option value="medium">Medium</option>
           <option value="low">Low</option>
        </select>
      </div>

      {/* Assignee Search Input visually clean tightly framed */}
      <div className="flex items-center gap-2 border-l border-gray-200 pl-6 flex-shrink-0">
        <span className="font-semibold text-gray-700 tracking-tight">Assignee:</span>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search matching name..." 
            value={filters.assignee || ''} 
            onChange={(e) => setFilters({ assignee: e.target.value })}
            className="bg-gray-50 hover:bg-white border border-gray-200 rounded-md pl-8 pr-3 py-1.5 text-xs w-48 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-medium text-gray-700 placeholder-gray-400"
          />
          <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      {/* Explicit Date Bounds logically separated */}
      <div className="flex items-center gap-2 border-l border-gray-200 pl-6 flex-shrink-0">
        <span className="font-semibold text-gray-700 tracking-tight flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          Due Dates:
        </span>
        <input 
          type="date" 
          value={filters.dateRange?.start || ''} 
          onChange={(e) => setFilters({ dateRange: { start: e.target.value, end: filters.dateRange?.end || '' }})}
          className="bg-gray-50 hover:bg-white border border-gray-200 rounded-md px-2 py-1 text-xs font-semibold text-gray-600 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer"
        />
        <span className="text-gray-400 font-bold px-1">&rarr;</span>
        <input 
          type="date" 
          value={filters.dateRange?.end || ''} 
          onChange={(e) => setFilters({ dateRange: { start: filters.dateRange?.start || '', end: e.target.value }})}
          className="bg-gray-50 hover:bg-white border border-gray-200 rounded-md px-2 py-1 text-xs font-semibold text-gray-600 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer"
        />
      </div>

      {/* Clear Filters Destructive Button Action */}
      <div className="flex-1 flex justify-end">
        {hasFilters && (
          <button 
            onClick={clearFilters}
            className="text-red-700 hover:text-white hover:bg-red-600 text-xs font-extrabold tracking-wide uppercase flex items-center gap-1.5 bg-red-50/80 outline outline-1 outline-red-200 px-3 py-1.5 rounded-lg shadow-sm transition-all animate-fade-in"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            Clear Filters
          </button>
        )}
      </div>

    </div>
  );
};
