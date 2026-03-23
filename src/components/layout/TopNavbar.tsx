import { useTaskStore } from '../../store/useTaskStore';

export const TopNavbar = () => {
  const { currentView, setCurrentView, activeUsers } = useTaskStore();

  const navItems = [
    { id: 'kanban', label: 'Kanban Board' },
    { id: 'list', label: 'List View' },
    { id: 'timeline', label: 'Timeline' }
  ] as const;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">ProjectManager</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100/80 p-1.5 rounded-lg border border-gray-200/50">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`
                    px-4 py-1.5 text-sm font-semibold rounded-md transition-all
                    ${currentView === item.id 
                      ? 'bg-white text-blue-700 shadow-sm border border-gray-200/80' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 border border-transparent'
                    }
                  `}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            <div className="ml-4 flex items-center gap-3 border-l border-gray-200 pl-4">
              <div className="flex items-center gap-2 mr-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-bold text-green-700">{activeUsers.length} people viewing</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-fuchsia-100 text-purple-700 border border-purple-200 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
                US
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
