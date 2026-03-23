import { useEffect, useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';

export const ActiveUsersOverlay = () => {
  const { activeUsers } = useTaskStore();
  const [positions, setPositions] = useState<Record<string, { x: number, y: number, opacity: number }>>({});

  useEffect(() => {
    const updatePositions = () => {
      const newPos: Record<string, { x: number, y: number, opacity: number }> = {};
      
      // Group users by the task they are on to handle stacking correctly
      const usersByTask = activeUsers.reduce((acc, user) => {
        if (user.currentTaskId) {
          if (!acc[user.currentTaskId]) acc[user.currentTaskId] = [];
          acc[user.currentTaskId].push(user);
        }
        return acc;
      }, {} as Record<string, typeof activeUsers>);

      activeUsers.forEach(user => {
        if (user.currentTaskId) {
          const el = document.querySelector(`[data-task-id="${user.currentTaskId}"]`);
          if (el) {
            const rect = el.getBoundingClientRect();
            const taskUsers = usersByTask[user.currentTaskId];
            const index = taskUsers.findIndex(u => u.id === user.id);
            
            // Stack avatars visually across the edge
            let baseX = rect.right - 25;
            let baseY = rect.bottom - 15;

            // If the element is technically scrolled out physically, hide it
            if (baseY < 0 || baseY > window.innerHeight) {
                newPos[user.id] = { ...positions[user.id], opacity: 0 };
            } else {
                newPos[user.id] = { 
                  x: baseX - (index * 15), 
                  y: baseY, 
                  opacity: 1 
                };
            }
          } else {
            // Task element not found rendered on screen right now
            newPos[user.id] = { ...positions[user.id], opacity: 0 };
          }
        } else {
          newPos[user.id] = { ...positions[user.id], opacity: 0 };
        }
      });
      
      setPositions(newPos);
    };

    updatePositions();
    
    // Smoothly track scrolling and resizing to keep avatars pinned
    window.addEventListener('resize', updatePositions);
    // Bind capturing scroll to catch ANY scroll internally in Kanban or ListView
    window.addEventListener('scroll', updatePositions, true);
    
    // Poll to sync state when activeUsers changes
    const timeout = setTimeout(updatePositions, 100);

    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions, true);
      clearTimeout(timeout);
    };
  }, [activeUsers]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {activeUsers.map(user => {
        const pos = positions[user.id];
        return (
          <div 
            key={user.id}
            className="absolute rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold transition-all duration-[800ms] ease-bounce shadow-xl transform -translate-x-1/2 -translate-y-1/2 will-change-transform"
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: user.color,
              top: pos?.y ? `${pos.y}px` : '-50px',
              left: pos?.x ? `${pos.x}px` : '-50px',
              opacity: pos?.opacity ?? 0,
              transform: pos?.opacity ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0)'
            }}
            title={`${user.name} is viewing this task`}
          >
            {user.initials}
          </div>
        );
      })}
    </div>
  );
};
