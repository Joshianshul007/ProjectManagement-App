import { Task, TaskStatus, TaskPriority, Assignee } from '../types/task';

// PRNG for explicit deterministic testing ensuring E2E stability
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

const getWeightedStatus = (rand: number): TaskStatus => {
  if (rand < 0.40) return 'done';         // 40% Graphically resolved
  if (rand < 0.75) return 'todo';         // 35% Deep Backlog
  if (rand < 0.90) return 'in-progress';  // 15% Active
  return 'review';                        // 10% Blocked / QA
};

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

export function generateMockTasks(count: number = 500, seed: number = 1337, referenceDate: Date = new Date()): Task[] {
  const tasks: Task[] = [];
  const random = mulberry32(seed); // Initialize explicit generator sequence
  
  for (let i = 1; i <= count; i++) {
    const status = getWeightedStatus(random());
    const priority = priorities[Math.floor(random() * priorities.length)];
    const assignee = assignees[Math.floor(random() * assignees.length)];
    const randomTitle = sampleTitles[Math.floor(random() * sampleTitles.length)];
    
    // Explicit anchoring against reference bounds natively scaling -30 to +30 days
    const startOffsetMinutes = Math.floor(random() * 60 * 24 * 60) - 30 * 24 * 60; 
    const durationMinutes = Math.floor(random() * 45 * 24 * 60) + 24 * 60; 
    
    const startDate = new Date(referenceDate.getTime() + startOffsetMinutes * 60 * 1000);
    const dueDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    tasks.push({
      id: `TASK-${i.toString().padStart(4, '0')}`,
      title: `${randomTitle} ${i}`,
      description: `Detailed description for task ${i}. We need to ensure that this is completed according to the project specifications and guidelines. Please review the attached documents for more context.`,
      status,
      priority,
      assignee,
      startDate: random() > 0.2 ? startDate.toISOString() : undefined, // 80% coverage
      dueDate: dueDate.toISOString(),
    });
  }
  
  return tasks;
}

export const mockTasks = generateMockTasks(505);
