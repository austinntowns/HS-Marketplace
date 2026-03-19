import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getMyAlerts, createAlert, updateAlert, deleteAlert } from "@/lib/alert-actions"
import { AlertsManager } from "./AlertsManager"

export default async function AlertsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const alerts = await getMyAlerts()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Listing Alerts</h1>
      <p className="text-gray-600 mb-8">
        Get notified when new listings become available in your selected states.
      </p>

      <AlertsManager
        initialAlerts={alerts}
        createAlertAction={createAlert}
        updateAlertAction={updateAlert}
        deleteAlertAction={deleteAlert}
      />
    </div>
  )
}
