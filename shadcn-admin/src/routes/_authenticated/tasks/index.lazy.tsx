import { createLazyFileRoute } from '@tanstack/react-router'
import docs from '@/features/tasks'

export const Route = createLazyFileRoute('/_authenticated/tasks/')({
  component: docs,
})
