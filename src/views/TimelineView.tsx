import { useTaskStore } from '../store/useTaskStore';

export const TimelineView = () => {
  const { getFilteredTasks } = useTaskStore();
  const tasks = getFilteredTasks();

  const sortedTasks = [...tasks]
    .filter(t => t.startDate)
    .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())
    .slice(0, 20); // Limiting for layout demo

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Timeline View</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {sortedTasks.map((task) => (
            <div key={task.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              {/* Point on the timeline */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm
                ${task.status === 'done' ? 'bg-green-500' : 'bg-blue-500'}`}>
                {task.status === 'done' ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              
              {/* Content Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between space-x-2 mb-2">
                  <div className="font-bold text-slate-900 text-lg">{task.title}</div>
                  <time className="font-semibold text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {new Date(task.startDate!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </time>
                </div>
                <div className="text-slate-600 mb-3 text-sm line-clamp-2">{task.description}</div>
                <div className="flex justify-between items-center text-slate-500 text-xs font-medium border-t pt-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">{task.assignee.name}</span>
                  </div>
                </div>
              </div>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
