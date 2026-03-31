"use client"

import type { Alert } from "@/db/schema/alerts"

interface AlertListProps {
  alerts: Alert[]
  onEdit: (alert: Alert) => void
  onDelete: (id: string) => void
}

export function AlertList({ alerts, onEdit, onDelete }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <p className="text-gray-500 py-4">
        You don&apos;t have any alerts yet. Create one to get notified when new listings become available.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="border rounded-lg p-4 flex justify-between items-start bg-white"
        >
          <div>
            <p className="font-medium text-gray-900">
              {alert.states && alert.states.length > 0
                ? alert.states.join(", ")
                : "All states"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Created {new Date(alert.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3 ml-4 shrink-0">
            <button
              onClick={() => onEdit(alert)}
              className="text-hs-red-600 hover:text-hs-red-700 text-sm font-medium focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-offset-2"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(alert.id)}
              className="text-hs-red-600 hover:text-hs-red-700 text-sm font-medium focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-offset-2"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
