import React from 'react';
import { Task, TaskStatus } from '../types/task';
import { formatTaskDueDate } from '../utils/dateFormatter';

interface ListViewRowProps {
  task: Task;
  rowHeight: number;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}

export const ListViewRow = React.memo(({ task, rowHeight, onUpdateStatus }: ListViewRowProps) => {
  const dateInfo = formatTaskDueDate(task);
  const isOverdue = dateInfo.isOverdue;
  const isToday = dateInfo.isToday;

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

  return (
    <tr data-task-id={task.id} style={{ height: rowHeight }} className="hover:bg-blue-50/50 transition-colors group">
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
        <span className={`text-sm font-semibold px-2.5 py-1 rounded flex items-center gap-1.5 w-max transition-colors
          ${isOverdue ? 'bg-red-50 text-red-700 outline outline-1 outline-red-200 shadow-sm' 
          : isToday ? 'bg-amber-50 text-amber-700 outline outline-1 outline-amber-300 shadow-sm'
          : 'text-gray-600'}`}>
          {isOverdue && <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
          {isToday && !isOverdue && <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
          {dateInfo.text}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap overflow-hidden">
        <div className="relative inline-block w-full max-w-[150px]">
          <select
            value={task.status}
            onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
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
});
