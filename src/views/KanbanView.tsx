import { useTaskStore } from '../store/useTaskStore';
import { TaskStatus } from '../types/task';

export const KanbanView = () => {
  const { getFilteredTasks } = useTaskStore();
  const tasks = getFilteredTasks();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date for accurate comparison
  
  const statuses: { id: TaskStatus; label: string }[] = [
    { id: 'todo', label: 'To Do' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'review', label: 'Review' },
    { id: 'done', label: 'Done' }
  ];

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
  }

  return (
    <div className="p-6 h-full flex flex-col max-w-[1600px] mx-auto">
      <div className="flex gap-6 overflow-x-auto pb-4 h-full items-start">
        {statuses.map(status => {
          const colTasks = tasks.filter(t => t.status === status.id);
          return (
            <div key={status.id} className="flex-shrink-0 w-80 bg-gray-100/80 rounded-xl flex flex-col h-full max-h-full border border-gray-200 shadow-sm">
              {/* Column Header */}
              <div className="p-4 font-bold text-gray-700 border-b border-gray-200/80 flex justify-between items-center bg-gray-100/50 rounded-t-xl">
                <div className="flex items-center gap-2">
                  {status.label}
                  <span className="bg-white text-gray-600 text-xs py-0.5 px-2 rounded-full font-semibold shadow-sm border border-gray-200">{colTasks.length}</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                </button>
              </div>

              {/* Column Body (Scrollable) */}
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {colTasks.map(task => {
                  const dueDate = new Date(task.dueDate);
                  dueDate.setHours(0, 0, 0, 0);
                  const isOverdue = dueDate < today && task.status !== 'done';
                  
                  return (
                    <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all flex flex-col gap-3 group">
                      
                      {/* Task Title */}
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-medium text-gray-900 text-sm leading-snug group-hover:text-blue-700 transition-colors">{task.title}</p>
                      </div>
                      
                      {/* Badges: Priority and Due Date */}
                      <div className="flex items-center flex-wrap gap-2 mt-1">
                        {getPriorityBadge(task.priority)}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1
                          ${isOverdue ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          {dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Footer: ID and Assignee Avatar */}
                      <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-50">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                          {task.id}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-xs font-bold shadow-sm" title={task.assignee.name}>
                          {task.assignee.initials}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {colTasks.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-sm font-medium text-gray-400">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
