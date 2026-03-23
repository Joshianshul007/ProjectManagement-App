import { useEffect } from 'react';
import { useTaskStore } from './store/useTaskStore';
import { TopNavbar } from './components/layout/TopNavbar';
import { KanbanView } from './views/KanbanView';
import { ListView } from './views/ListView';
import { TimelineView } from './views/TimelineView';
import { ActiveUsersOverlay } from './components/ActiveUsersOverlay';

function App() {
  const { currentView, startUserSimulation } = useTaskStore();

  useEffect(() => {
    startUserSimulation();
  }, [startUserSimulation]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <TopNavbar />
      <ActiveUsersOverlay />
      <main className="flex-1 w-full overflow-hidden">
        <div className="h-full overflow-y-auto w-full">
          {currentView === 'kanban' && <KanbanView />}
          {currentView === 'list' && <ListView />}
          {currentView === 'timeline' && <TimelineView />}
        </div>
      </main>
    </div>
  );
}

export default App;
