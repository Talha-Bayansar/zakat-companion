import { createFileRoute } from "@tanstack/react-router"

import { ReminderPreferencesPage } from "@/features/reminders"

export const Route = createFileRoute("/app/settings/reminders/")({
  component: ReminderPreferencesRoute,
})

function ReminderPreferencesRoute() {
  return <ReminderPreferencesPage />
}
