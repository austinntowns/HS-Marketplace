"use client"

import { useState } from "react"
import type { Alert } from "@/db/schema/alerts"
import { AlertForm } from "@/components/alerts/AlertForm"
import { AlertList } from "@/components/alerts/AlertList"

interface AlertsManagerProps {
  initialAlerts: Alert[]
  createAlertAction: (data: { states?: string[] }) => Promise<{ success?: boolean; alert?: Alert; error?: string }>
  updateAlertAction: (id: string, data: { states?: string[] }) => Promise<{ success?: boolean; error?: string }>
  deleteAlertAction: (id: string) => Promise<{ success?: boolean; error?: string }>
}

export function AlertsManager({
  initialAlerts,
  createAlertAction,
  updateAlertAction,
  deleteAlertAction,
}: AlertsManagerProps) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(data: { states?: string[] }) {
    setError(null)
    const result = await createAlertAction(data)
    if (result.error) {
      setError(result.error)
    } else if (result.alert) {
      setAlerts((prev) => [result.alert!, ...prev])
      setShowCreateForm(false)
    }
  }

  async function handleUpdate(data: { states?: string[] }) {
    if (!editingAlert) return
    setError(null)
    const result = await updateAlertAction(editingAlert.id, data)
    if (result.error) {
      setError(result.error)
    } else {
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === editingAlert.id
            ? { ...a, states: data.states ?? [], updatedAt: new Date() }
            : a,
        ),
      )
      setEditingAlert(null)
    }
  }

  async function handleDelete(id: string) {
    setError(null)
    const result = await deleteAlertAction(id)
    if (result.error) {
      setError(result.error)
    } else {
      setAlerts((prev) => prev.filter((a) => a.id !== id))
    }
  }

  const isFormVisible = showCreateForm || editingAlert !== null

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {isFormVisible ? (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingAlert ? "Edit Alert" : "Create New Alert"}
          </h2>
          <AlertForm
            alert={editingAlert ?? undefined}
            onSubmit={editingAlert ? handleUpdate : handleCreate}
            onCancel={() => {
              setEditingAlert(null)
              setShowCreateForm(false)
              setError(null)
            }}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 font-medium"
        >
          + Create New Alert
        </button>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">Your Alerts</h2>
        <AlertList
          alerts={alerts}
          onEdit={(alert) => {
            setEditingAlert(alert)
            setShowCreateForm(false)
            setError(null)
          }}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
