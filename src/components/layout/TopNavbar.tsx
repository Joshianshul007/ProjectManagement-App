import { useTaskStore } from '../../store/useTaskStore';

export const TopNavbar = () => {
  const currentView = useTaskStore(state => state.currentView);
  const setCurrentView = useTaskStore(state => state.setCurrentView);
  const activeUsersCount = useTaskStore(state => state.activeUsers.filter(u => u.currentTaskId !== null).length);

  const navItems = [
    { id: 'kanban', label: 'Kanban Board' },
    { id: 'list', label: 'List View' },
    { id: 'timeline', label: 'Timeline' }
  ] as const;

  return (
    <nav aria-label="Main navigation" className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm flex-shrink-0">
      <div className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between h-16 w-full overflow-hidden">
          <div className="flex items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">ProjectManager</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto custom-scrollbar pl-4 md:pl-0 flex-1 justify-end">
            <div className="flex bg-gray-100/80 p-1 md:p-1.5 rounded-lg border border-gray-200/50 flex-shrink-0">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  aria-label={`Switch to ${item.label}`}
                  aria-current={currentView === item.id ? 'page' : undefined}
                  className={`
                    px-3 md:px-4 py-1.5 text-xs md:text-sm font-semibold rounded-md transition-all whitespace-nowrap
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
            
            <div className="ml-2 flex items-center gap-2 md:gap-3 border-l border-gray-200 pl-2 md:pl-4 flex-shrink-0">
              <div className="flex items-center gap-1.5 md:mr-2 bg-green-50 px-2 md:px-3 py-1.5 rounded-full border border-green-200 shadow-sm whitespace-nowrap">
                <div className={`w-2 h-2 rounded-full ${activeUsersCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className={`text-[10px] md:text-xs font-bold hidden sm:block ${activeUsersCount > 0 ? 'text-green-700' : 'text-gray-600'}`}>{activeUsersCount} viewing</span>
                <span className={`text-[10px] font-bold sm:hidden ${activeUsersCount > 0 ? 'text-green-700' : 'text-gray-600'}`}>{activeUsersCount}</span>
              </div>
              <div aria-label="Current user" role="img" className="w-8 h-8 bg-gradient-to-br from-purple-100 to-fuchsia-100 text-purple-700 border border-purple-200 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
                US
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
