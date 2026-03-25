import { createFileRoute } from '@tanstack/react-router'
import TasksPage from '@/features/task/components/TasksPage'

export const Route = createFileRoute('/tasks/' as any)({
  component: TasksPage,
})
