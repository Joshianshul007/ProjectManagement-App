import { useTaskStore } from './store/useTaskStore'

function App() {
  const { tasks, getFilteredTasks, updateTaskStatus } = useTaskStore()
  
  const filteredTasks = getFilteredTasks();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-900 p-8">
      <h1 className="text-4xl font-bold mb-8 text-blue-600">Task Management App</h1>
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <p className="text-xl font-medium text-gray-700">Total Global Tasks: <span className="font-bold text-blue-600">{tasks.length}</span></p>
          <p className="text-xl font-medium text-gray-700">Filtered View: <span className="font-bold text-green-600">{filteredTasks.length}</span></p>
        </div>
        
        <div className="grid grid-cols-1 gap-4 mt-6">
          {filteredTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="p-4 border border-gray-100 bg-gray-50 rounded-lg flex justify-between items-center hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-bold text-lg">{task.title}</h3>
                <p className="text-sm text-gray-500">Assignee: {task.assignee.name} | Status: <span className="uppercase font-semibold text-xs tracking-wider">{task.status}</span></p>
              </div>
              
              <button
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded font-medium transition-colors text-sm"
                onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
              >
                Toggle Status
              </button>
            </div>
          ))}
          {filteredTasks.length > 5 && (
            <p className="text-center text-gray-400 mt-4 text-sm font-medium tracking-wide uppercase">+ {filteredTasks.length - 5} More Tasks Available</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
