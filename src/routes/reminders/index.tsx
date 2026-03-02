import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reminders/')({
  component: RemindersPage,
})

function RemindersPage() {
  return <div>reminders</div>
}
