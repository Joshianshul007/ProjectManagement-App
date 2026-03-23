import { useRef, UIEvent, useMemo } from 'react';
import { useFilteredTasks } from '../hooks/useFilteredTasks';
import { Task } from '../types/task';

export const TimelineView = () => {
  const tasks = useFilteredTasks();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const datesInMonth = Array.from({ length: daysInMonth }, (_, i) => new Date(currentYear, currentMonth, i + 1));
  
  const monthStart = new Date(currentYear, currentMonth, 1).valueOf();
  const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999).valueOf();
  
  const colWidth = 50; // px width per day natively tracking standard horizontal block units

  // Filter and compute tasks strictly for the current month
  const tasksInMonth = useMemo(() => {
    return tasks.filter(t => {
      const taskStart = t.startDate ? new Date(t.startDate).valueOf() : new Date(t.dueDate).setHours(0,0,0,0);
      const taskEnd = new Date(t.dueDate).setHours(23,59,59,999);
      if (taskEnd < monthStart || taskStart > monthEnd) return false;
      return true;
    }).sort((a, b) => {
      // Sort organically by start date to form waterfall effect natively easily
      const aStart = a.startDate ? new Date(a.startDate).valueOf() : new Date(a.dueDate).valueOf();
      const bStart = b.startDate ? new Date(b.startDate).valueOf() : new Date(b.dueDate).valueOf();
      return aStart - bStart;
    });
  }, [tasks, monthStart, monthEnd]);

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-gray-400';
      default: return 'bg-indigo-500';
    }
  };

  const leftPanelRef = useRef<HTMLDivElement>(null);

  // Sync the vertical scroll of the Timeline grid cleanly back to the left labels panel
  const handleTimelineScroll = (e: UIEvent<HTMLDivElement>) => {
    if (leftPanelRef.current) {
      leftPanelRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-full mx-auto h-full flex flex-col pb-10">
      <div className="flex justify-between items-center mb-6 px-2 md:px-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Timeline View</h2>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-wide font-semibold">{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
        <span className="bg-white border border-gray-200 text-gray-600 px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-sm">
          {tasksInMonth.length} tasks scheduled
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col max-h-[calc(100vh-140px)] ml-0 md:ml-4 mr-0 md:mr-4">
        
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left panel: Task Names strictly fixed position handling mapped index natively */}
          <div className="w-40 md:w-64 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col z-20 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
            <div className="h-14 border-b border-gray-200 bg-gray-50 flex items-center px-4 font-bold text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">
              Task Name
            </div>
            {/* Hiding overflowing natively to strictly rely on sync */}
            <div className="overflow-hidden flex-1" ref={leftPanelRef}>
              {tasksInMonth.length === 0 ? (
                <div className="p-6 text-sm text-gray-500 text-center font-medium">No tasks scheduled for this month.</div>
              ) : (
                tasksInMonth.map((task: Task) => (
                  <div key={task.id} className="h-12 border-b border-gray-100/50 flex items-center px-4 hover:bg-gray-50 transition-colors group cursor-default">
                    <span className="text-sm font-semibold text-gray-700 truncate group-hover:text-blue-700">{task.title}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right panel: Virtualized scrollable grid containing horizontally laid blocks natively */}
          <div 
            className="flex-1 overflow-auto custom-scrollbar relative bg-white" 
            onScroll={handleTimelineScroll}
          >
            {/* Header Dates Row purely inline tracked seamlessly via inline block generation */}
            <div className="flex h-14 border-b border-gray-200 bg-gray-50 sticky top-0 z-20 box-content" style={{ width: `${daysInMonth * colWidth}px` }}>
              {datesInMonth.map(date => {
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isToday = date.getTime() === today.getTime();
                
                return (
                  <div 
                    key={date.getTime()} 
                    className={`flex-shrink-0 border-r border-gray-200 flex flex-col items-center justify-center
                      ${isWeekend ? 'bg-gray-100/70' : ''}
                      ${isToday ? 'bg-blue-100 text-blue-800' : 'text-gray-500'}
                    `}
                    style={{ width: `${colWidth}px` }}
                  >
                    <span className={`text-[10px] uppercase font-extrabold ${isToday ? 'tracking-wider' : ''}`}>
                      {date.toLocaleDateString(undefined, { weekday: 'narrow' })}
                    </span>
                    <span className="text-xs font-bold">{date.getDate()}</span>
                  </div>
                );
              })}
            </div>

            {/* Task Row Iteration inside the grid tracking spatial overlaps precisely natively */}
            <div className="relative pb-6" style={{ width: `${daysInMonth * colWidth}px` }}>
              
              {/* Vertical Today Full-Column Highlight running from top to bottom seamlessly seamlessly z-indexing 0 */}
              <div 
                className="absolute top-0 bottom-0 pointer-events-none z-0 bg-blue-50/40 border-x border-blue-200/60 transition-all shadow-inner"
                style={{ 
                  left: `${(today.getDate() - 1) * colWidth}px`, 
                  width: `${colWidth}px` 
                }}
              ></div>

              {tasksInMonth.map((task: Task) => {
                const startRaw = task.startDate ? new Date(task.startDate) : new Date(task.dueDate);
                const endRaw = new Date(task.dueDate);
                
                const startDay = Math.max(1, startRaw < new Date(monthStart) ? 1 : startRaw.getDate());
                const endDay = Math.min(daysInMonth, endRaw > new Date(monthEnd) ? daysInMonth : endRaw.getDate());
                
                const leftPos = (startDay - 1) * colWidth;
                const width = ((endDay - startDay) + 1) * colWidth;
                const isSingleDay = !task.startDate || startDay === endDay;

                return (
                  <div key={task.id} data-task-id={task.id} className="h-12 border-b border-gray-100/30 flex items-center relative z-10 px-1 hover:bg-gray-50/50 transition-colors">
                    <div 
                      className={`absolute h-7 shadow-sm transition-all flex items-center group overflow-hidden border border-black/10 cursor-pointer hover:shadow-md hover:brightness-110
                        ${getPriorityColor(task.priority)}
                        ${isSingleDay ? 'rounded-full px-2 justify-center' : 'rounded-md px-3'}
                      `}
                      style={{ 
                        left: `${leftPos + (isSingleDay ? 6 : 4)}px`, 
                        width: `${isSingleDay ? colWidth - 12 : Math.max(width - 8, 20)}px`,
                        opacity: task.status === 'done' ? 0.4 : 1
                      }}
                      title={`${task.title}\nPriority: ${task.priority}\nDue: ${new Date(task.dueDate).toLocaleDateString()}`}
                    >
                       {/* Only show embedded internal title conditionally natively relying heavily on css group hovering to keep clean lines */}
                       {!isSingleDay && width > 80 && (
                         <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity truncate drop-shadow-sm select-none">
                           {task.title}
                         </span>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};
