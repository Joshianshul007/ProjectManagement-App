import { useTaskStore } from '../store/useTaskStore';
import { TaskStatus } from '../types/task';

export const KanbanView = () => {
  const { getFilteredTasks } = useTaskStore();
  const tasks = getFilteredTasks();
  
  const statuses: { id: TaskStatus; label: string }[] = [
    { id: 'todo', label: 'To Do' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'review', label: 'Review' },
    { id: 'done', label: 'Done' }
  ];

  return (
    <div className="p-6 h-full flex flex-col max-w-[1600px] mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Kanban Board</h2>
      <div className="flex gap-6 overflow-x-auto pb-4 h-full items-start">
        {statuses.map(status => {
          const colTasks = tasks.filter(t => t.status === status.id);
          return (
            <div key={status.id} className="flex-shrink-0 w-80 bg-gray-100 rounded-xl flex flex-col max-h-full">
              <div className="p-4 font-bold text-gray-700 border-b border-gray-200 flex justify-between items-center">
                {status.label}
                <span className="bg-gray-200 text-gray-600 text-xs py-1 px-2.5 rounded-full font-medium">{colTasks.length}</span>
              </div>
              <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {colTasks.slice(0, 50).map(task => (
                  <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-medium text-gray-900 text-sm leading-snug">{task.title}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {task.id}
                      </span>
                      <div className="flex items-center gap-2">
                        {task.priority === 'critical' && <span className="w-2 h-2 rounded-full bg-red-500" title="Critical Priority"></span>}
                        {task.priority === 'high' && <span className="w-2 h-2 rounded-full bg-orange-500" title="High Priority"></span>}
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shadow-sm" title={task.assignee.name}>
                          {task.assignee.initials}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
