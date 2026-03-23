import { PointerEvent as ReactPointerEvent, useEffect, useRef } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Task, TaskStatus } from '../types/task';
import { useFilteredTasks } from '../hooks/useFilteredTasks';
import { KanbanCard } from '../components/KanbanCard';

export const KanbanView = () => {
  const updateTaskStatus = useTaskStore(state => state.updateTaskStatus);
  const tasks = useFilteredTasks();
  
  const statuses: { id: TaskStatus; label: string }[] = [
    { id: 'todo', label: 'To Do' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'review', label: 'Review' },
    { id: 'done', label: 'Done' }
  ];

  // Drag and drop state dynamically hybridized against strict global boundaries
  const draggingTaskId = useTaskStore(state => state.draggingTaskId);
  const dropTargetStatus = useTaskStore(state => state.dropTargetStatus);
  const setDraggingTask = useTaskStore(state => state.setDraggingTask);
  const setDropTargetStatus = useTaskStore(state => state.setDropTargetStatus);
  
  const draggingTask = tasks.find(t => t.id === draggingTaskId) || null;
  
  // Fast-path local tracking purely isolated from 60fps Redux virtual diff DOM repaints
  const ghostRef = useRef<HTMLDivElement>(null);
  const initialPosRef = useRef<{ x: number, y: number } | null>(null);

  // ---- Unified Pointer Events (Drag & Drop) ----
  const handlePointerDown = (e: ReactPointerEvent, task: Task) => {
    // Only accept primary button clicks (left click) or direct touches
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    
    e.preventDefault();

    initialPosRef.current = { x: e.clientX, y: e.clientY };
    setDraggingTask(task.id);
    setDropTargetStatus(task.status);
    
    // Disable text selection visually during global drag
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!draggingTask) return;

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();

      // Hardware-accelerated direct DOM manipulation bypassing 60fps React virtual diffs!
      if (ghostRef.current) {
        ghostRef.current.style.transform = `translate3d(${e.clientX - 140}px, ${e.clientY - 60}px, 0)`;
      }

      // Hit testing elements underneath the pointer
      // Crucial: Ensure ghost card has pointer-events-none completely isolating it physically
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
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

    const handlePointerUp = () => {
      if (draggingTask && dropTargetStatus && draggingTask.status !== dropTargetStatus) {
        updateTaskStatus(draggingTask.id, dropTargetStatus);
      }
      setDraggingTask(null);
      setDropTargetStatus(null);
      initialPosRef.current = null;
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [draggingTask, dropTargetStatus, updateTaskStatus]);

  // Wrap internal logic correctly
  const renderTaskCard = (task: Task, isGhost: boolean = false, isPlaceholder: boolean = false) => {
    return (
      <div key={isGhost || isPlaceholder ? `ghost-${task.id}` : task.id}>
        <KanbanCard 
          task={task} 
          isGhost={isGhost} 
          isPlaceholder={isPlaceholder} 
          onPointerDown={!isGhost && !isPlaceholder ? (e) => handlePointerDown(e, task) : undefined}
          draggingTask={draggingTask}
        />
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col max-w-[1600px] mx-auto relative overflow-hidden">
      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 h-full items-start custom-scrollbar">
        {statuses.map(status => {
          const columnTasks = tasks.filter((t: Task) => t.status === status.id);
          const isDropTarget = dropTargetStatus === status.id;
          
          return (
            <div 
              key={status.id} 
              data-column-status={status.id}
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
      {draggingTask && initialPosRef.current && (
        <div 
          ref={ghostRef}
          className="fixed pointer-events-none z-[100] left-0 top-0 will-change-transform"
          style={{
            transform: `translate3d(${initialPosRef.current.x - 140}px, ${initialPosRef.current.y - 60}px, 0)`,
            width: '320px',
          }}
        >
          {renderTaskCard(draggingTask, true)}
        </div>
      )}
    </div>
  );
};
