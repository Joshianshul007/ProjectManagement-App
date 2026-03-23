import { useState, TouchEvent as ReactTouchEvent } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Task, TaskStatus } from '../types/task';
import { formatTaskDueDate } from '../utils/dateFormatter';

export const KanbanView = () => {
  const { getFilteredTasks, updateTaskStatus } = useTaskStore();
  const tasks = getFilteredTasks();
  
  const statuses: { id: TaskStatus; label: string }[] = [
    { id: 'todo', label: 'To Do' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'review', label: 'Review' },
    { id: 'done', label: 'Done' }
  ];

  // Drag and drop state
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [dropTargetStatus, setDropTargetStatus] = useState<TaskStatus | null>(null);
  const [touchPos, setTouchPos] = useState<{ x: number, y: number } | null>(null);

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'critical': 
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider shadow-sm border border-red-200">Critical</span>;
      case 'high': 
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 uppercase tracking-wider shadow-sm border border-orange-200">High</span>;
      case 'medium': 
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider shadow-sm border border-blue-200">Medium</span>;
      case 'low': 
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 uppercase tracking-wider shadow-sm border border-gray-200">Low</span>;
      default: 
        return null;
    }
  }

  // ---- HTML5 DND Handlers ----
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggingTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    // Setting setDragImage here if needed, but default is fine
  };

  const handleDragOver = (e: React.DragEvent, statusId: TaskStatus) => {
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetStatus !== statusId) {
      setDropTargetStatus(statusId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Intentionally left blank to avoid flickering, handled by DragEnd and Drop
  };

  const handleDrop = (e: React.DragEvent, statusId: TaskStatus) => {
    e.preventDefault();
    if (draggingTask && draggingTask.status !== statusId) {
      updateTaskStatus(draggingTask.id, statusId);
    }
    setDraggingTask(null);
    setDropTargetStatus(null);
  };

  const handleDragEnd = () => {
    setDraggingTask(null);
    setDropTargetStatus(null);
  };

  // ---- Touch Handlers ----
  const handleTouchStart = (e: ReactTouchEvent, task: Task) => {
    const touch = e.touches[0];
    setDraggingTask(task);
    setTouchPos({ x: touch.clientX, y: touch.clientY });
    setDropTargetStatus(task.status); // Default to current column
    
    // Prevent document scrolling while dragging
    document.body.style.overflow = 'hidden';
  };

  const handleTouchMove = (e: ReactTouchEvent) => {
    if (!draggingTask) return;
    
    const touch = e.touches[0];
    setTouchPos({ x: touch.clientX, y: touch.clientY });
    
    // Find column underneath the touch point
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const columnElement = elements.find(el => el.hasAttribute('data-column-status'));
    
    if (columnElement) {
      const status = columnElement.getAttribute('data-column-status') as TaskStatus;
      if (dropTargetStatus !== status) {
        setDropTargetStatus(status);
      }
    } else {
      setDropTargetStatus(null);
    }
  };

  const handleTouchEnd = () => {
    if (draggingTask && dropTargetStatus && draggingTask.status !== dropTargetStatus) {
      updateTaskStatus(draggingTask.id, dropTargetStatus);
    }
    setDraggingTask(null);
    setDropTargetStatus(null);
    setTouchPos(null);
    
    // Restore scrolling
    document.body.style.overflow = '';
  };

  // Add passive event listener cleanup if needed, but since touch handlers are inline React warns safely

  // Card Rendering function to reuse for actual and touch ghost
  const renderTaskCard = (task: Task, isGhost: boolean = false, isPlaceholder: boolean = false) => {
    const dateInfo = formatTaskDueDate(task);
    const isOverdue = dateInfo.isOverdue;
    const isToday = dateInfo.isToday;

    let containerClass = "bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all flex flex-col gap-3 group select-none";
    if (isPlaceholder) {
      containerClass = "bg-blue-50 border-2 border-dashed border-blue-400 opacity-70 p-4 rounded-lg flex flex-col gap-3";
    } else if (isGhost) {
      containerClass += " opacity-90 shadow-2xl scale-105 border-blue-500 z-50 pointer-events-none";
    } else {
      containerClass += " cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-400";
      if (draggingTask?.id === task.id && !touchPos) {
        // Desktop HTML5 dragging state (native dragging)
        containerClass += " opacity-50 border-dashed border-2";
      } else if (draggingTask?.id === task.id && touchPos) {
        // Hiding the original card entirely when touched to only show flying ghost
        containerClass += " opacity-0 h-0 p-0 m-0 overflow-hidden border-none";
      }
    }

    return (
      <div 
        key={task.id} 
        data-task-id={!isGhost && !isPlaceholder ? task.id : undefined}
        className={containerClass}
        draggable={!isGhost && !isPlaceholder}
        onDragStart={(e) => handleDragStart(e, task)}
        onDragEnd={handleDragEnd}
        onTouchStart={(e) => handleTouchStart(e, task)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        // Tailwind class utility to disable default touch interactions on mobile browsers allowing custom JS dragging
        style={{ touchAction: 'none' }} 
      >
        {(!isPlaceholder && !(draggingTask?.id === task.id && touchPos)) && (
          <>
            <div className="flex justify-between items-start gap-2">
              <p className="font-bold text-gray-800 text-sm leading-snug group-hover:text-blue-700 transition-colors pointer-events-none">{task.title}</p>
            </div>
            
            <div className="flex items-center flex-wrap gap-2 mt-1 pointer-events-none">
              {getPriorityBadge(task.priority)}
            </div>

            <div className={`mt-4 flex items-center justify-between
          ${isOverdue ? 'text-red-600' : isToday ? 'text-amber-600' : 'text-gray-500'}
        `}>
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
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-800 border-2 border-white ring-1 ring-indigo-200 flex items-center justify-center text-xs font-black shadow-sm" title={task.assignee.name}>
                {task.assignee.initials}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col max-w-[1600px] mx-auto relative overflow-hidden">
      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 h-full items-start custom-scrollbar">
        {statuses.map(status => {
          const columnTasks = tasks.filter(t => t.status === status.id);
          const isDropTarget = dropTargetStatus === status.id;
          const isDragOver = draggingTask && dropTargetStatus === status.id;
          
          return (
            <div 
              key={status.id} 
              data-column-status={status.id}
              onDragOver={(e) => handleDragOver(e, status.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status.id)}
              className={`flex flex-col w-[280px] md:w-[340px] flex-shrink-0 max-h-full bg-gray-50/50 rounded-xl border border-gray-200 shadow-sm transition-all duration-300
                ${isDropTarget ? 'ring-2 ring-blue-400 bg-blue-50/30 shadow-md' : 'hover:shadow-md'}
              `}
            >
              {/* Column Header */}
              <div className={`p-4 font-bold text-gray-700 border-b flex justify-between items-center rounded-t-xl transition-colors
                ${isDropTarget ? 'border-blue-200 bg-blue-100/50 text-blue-800' : 'border-gray-200/80 bg-gray-100/50'}
              `}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status.id === 'todo' ? 'bg-slate-400' : status.id === 'in-progress' ? 'bg-blue-500' : status.id === 'review' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                  {status.label}
                  <span className={`text-xs py-0.5 px-2 rounded-full font-bold shadow-sm border 
                    ${isDropTarget ? 'bg-blue-200 text-blue-800 border-blue-300' : 'bg-white text-gray-600 border-gray-200'}
                  `}>{columnTasks.length + (isDropTarget && draggingTask && draggingTask.status !== status.id ? 1 : 0)}</span>
                </div>
              </div>

              {/* Column Body */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {columnTasks.length === 0 && !isDragOver && (
              <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 text-sm font-medium">
                <svg className="w-6 h-6 mb-1 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                Drop tasks here
              </div>
            )}
            {columnTasks.map(task => renderTaskCard(task, false))}
                
                {/* Visual Placeholder for Drop Target */}
                {isDropTarget && draggingTask && draggingTask.status !== status.id && (
                  renderTaskCard(draggingTask, false, true)
                )}
                {columnTasks.length === 0 && (!isDropTarget || (draggingTask && draggingTask.status === status.id)) && (
                  <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-sm font-medium text-gray-400 pointer-events-none">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Touch Flying Ghost Card */}
      {touchPos && draggingTask && (
        <div 
          className="fixed pointer-events-none z-[100]"
          style={{
            left: touchPos.x - 140, // Offset horizontally to center roughly
            top: touchPos.y - 60, // Offset vertically
            width: '320px',
          }}
        >
          {renderTaskCard(draggingTask, true)}
        </div>
      )}
    </div>
  );
};
