import { Task } from '../types/task';

export const formatTaskDueDate = (task: Task) => {
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const isToday = diffDays === 0;
  const isOverdue = diffDays > 0;
  
  let text = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  
  if (isToday) {
    text = 'Due Today';
  } else if (isOverdue && diffDays > 7 && task.status !== 'done') {
    text = `${diffDays} days overdue`;
  }
  
  return {
    text,
    isOverdue: isOverdue && task.status !== 'done',
    isToday: isToday && task.status !== 'done'
  };
};
