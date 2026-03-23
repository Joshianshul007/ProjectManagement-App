import React from 'react';
import { Task } from '../types/task';
import { formatTaskDueDate } from '../utils/dateFormatter';

interface KanbanCardProps {
  task: Task;
  isGhost?: boolean;
  isPlaceholder?: boolean;
  onPointerDown?: (e: React.PointerEvent, task: Task) => void;
  draggingTask?: Task | null;
}

export const KanbanCard = React.memo(({ 
  task, 
  isGhost = false, 
  isPlaceholder = false, 
  onPointerDown,
  draggingTask
}: KanbanCardProps) => {
  const dateInfo = formatTaskDueDate(task);
  const isOverdue = dateInfo.isOverdue;
  const isToday = dateInfo.isToday;

  let containerClass = "bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all flex flex-col gap-3 group select-none";
  if (isPlaceholder) {
    containerClass = "bg-blue-50 border-2 border-dashed border-blue-400 opacity-70 p-4 rounded-lg flex flex-col gap-3";
  } else if (!isGhost) {
    containerClass += " hover:shadow-md hover:border-gray-300 cursor-grab active:cursor-grabbing hover:bg-gray-50/20";
    if (draggingTask?.id === task.id) {
      // Retain physical DOM box model strictly but render invisible avoiding nasty column jumping
      containerClass += " opacity-0 pointer-events-none";
    }
  } else {
    containerClass += " opacity-90 shadow-2xl scale-105 border-blue-500 z-50 pointer-events-none";
  }

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'critical': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">Critical</span>;
      case 'high': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 uppercase tracking-wider">High</span>;
      case 'medium': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">Medium</span>;
      case 'low': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 uppercase tracking-wider">Low</span>;
      default: return null;
    }
  };

  return (
    <div 
      data-task-id={!isGhost && !isPlaceholder ? task.id : undefined}
      className={containerClass}
      onPointerDown={onPointerDown ? (e) => onPointerDown(e, task) : undefined}
      style={{ touchAction: !isGhost && !isPlaceholder ? 'none' : 'auto' }}
    >
      <div className="flex justify-between items-start pointer-events-none">
        <h4 className={`font-semibold ${task.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
          {task.title}
        </h4>
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-800 border-[1.5px] border-white ring-1 ring-indigo-200 flex flex-shrink-0 items-center justify-center text-[10px] font-black shadow-sm" title={task.assignee.name}>
          {task.assignee.initials}
        </div>
      </div>
      
      <div className="flex items-center flex-wrap gap-2 mt-1 pointer-events-none">
        {getPriorityBadge(task.priority)}
      </div>

      <div className={`mt-4 flex items-center justify-between ${isOverdue ? 'text-red-600' : isToday ? 'text-amber-600' : 'text-gray-500'}`}>
          <div className="flex items-center gap-1.5 text-xs font-semibold bg-gray-50 px-2 py-1 rounded border border-gray-100">
            <svg className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-500' : isToday ? 'text-amber-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={isOverdue ? 'text-red-700 font-bold' : isToday ? 'text-amber-700 font-bold' : ''}>
              {dateInfo.text}
            </span>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {task.id}
          </span>
      </div>
    </div>
  );
});
