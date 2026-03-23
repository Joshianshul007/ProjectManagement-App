import { Task, TaskStatus, TaskPriority, Assignee } from '../types/task';

const statuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];
const priorities: TaskPriority[] = ['critical', 'high', 'medium', 'low'];
const assignees: Assignee[] = [
  { name: 'Alice Smith', initials: 'AS' },
  { name: 'Bob Jones', initials: 'BJ' },
  { name: 'Charlie Brown', initials: 'CB' },
  { name: 'Diana Prince', initials: 'DP' },
  { name: 'Evan Wright', initials: 'EW' },
  { name: 'Fiona Gallagher', initials: 'FG' },
  { name: 'George Miller', initials: 'GM' },
  { name: 'Hannah Abbott', initials: 'HA' }
];

const sampleTitles = [
  'Design new landing page',
  'Fix navigation bug on mobile',
  'Implement authentication flow',
  'Write unit tests for checkout',
  'Update API documentation',
  'Optimize database queries',
  'Create user onboarding tutorial',
  'Migrate from REST to GraphQL',
  'Setup CI/CD pipeline',
  'Refactor state management',
  'Audit accessibility compliance',
  'Fix memory leak in dashboard',
  'Update dependencies to latest versions',
  'Implement dark mode',
  'Add multi-language support'
];

export function generateMockTasks(count: number = 500): Task[] {
  const tasks: Task[] = [];
  const now = new Date();
  
  for (let i = 1; i <= count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const assignee = assignees[Math.floor(Math.random() * assignees.length)];
    const randomTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
    
    // Generate dates: start offset between -30 and +30 days from now
    const startOffsetMinutes = Math.floor(Math.random() * 60 * 24 * 60) - 30 * 24 * 60; 
    // Duration between 1 and 45 days
    const durationMinutes = Math.floor(Math.random() * 45 * 24 * 60) + 24 * 60; 
    
    const startDate = new Date(now.getTime() + startOffsetMinutes * 60 * 1000);
    const dueDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    tasks.push({
      id: `TASK-${i.toString().padStart(4, '0')}`,
      title: `${randomTitle} ${i}`,
      description: `Detailed description for task ${i}. We need to ensure that this is completed according to the project specifications and guidelines. Please review the attached documents for more context.`,
      status,
      priority,
      assignee,
      startDate: Math.random() > 0.2 ? startDate.toISOString() : undefined, // 80% have a start date
      dueDate: dueDate.toISOString(),
    });
  }
  
  return tasks;
}

export const mockTasks = generateMockTasks(505);
