import { useTaskStore } from '../../store/useTaskStore';

export const TopNavbar = () => {
  const { currentView, setCurrentView } = useTaskStore();

  const navItems = [
    { id: 'kanban', label: 'Kanban Board' },
    { id: 'list', label: 'List View' },
    { id: 'timeline', label: 'Timeline' }
  ] as const;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ProjectManager</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-md transition-colors
                    ${currentView === item.id 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                    }
                  `}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            <div className="ml-4 flex items-center gap-3 border-l border-gray-200 pl-4">
              <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">
                US
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
