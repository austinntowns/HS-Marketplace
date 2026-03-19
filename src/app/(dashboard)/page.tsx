import { auth } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Welcome to Hello Sugar Marketplace</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Account</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium">{session?.user?.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Role</dt>
            <dd className="font-medium capitalize">{session?.user?.role || "user"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Seller Access</dt>
            <dd className="font-medium">{session?.user?.sellerAccess ? "Yes" : "No"}</dd>
          </div>
        </dl>
      </div>

      <p className="text-gray-600">
        Marketplace features coming in Phase 2. This page confirms your authentication is working.
      </p>
    </div>
  )
}
