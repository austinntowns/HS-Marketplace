import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getUsers, getAllowlist, setUserRole, setSellerAccess, addToAllowlist, removeFromAllowlist, removeUser } from "./actions"

export default async function AdminUsersPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "admin") {
    redirect("/")
  }

  const [userList, allowlistEntries] = await Promise.all([
    getUsers(),
    getAllowlist(),
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">User Management</h1>

      {/* Users Table */}
      <section className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Registered Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller Access</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userList.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <form action={async () => {
                      "use server"
                      await setUserRole(user.id, user.role === "admin" ? "user" : "admin")
                    }}>
                      <button
                        type="submit"
                        className={`px-2 py-1 text-xs rounded focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <form action={async () => {
                      "use server"
                      await setSellerAccess(user.id, !user.sellerAccess)
                    }}>
                      <button
                        type="submit"
                        className={`px-2 py-1 text-xs rounded focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 ${
                          user.sellerAccess
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.sellerAccess ? "Yes" : "No"}
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.id !== session.user.id && (
                      <form action={async () => {
                        "use server"
                        await removeUser(user.id)
                      }}>
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-800 text-sm focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
                        >
                          Remove
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Allowlist Section */}
      <section className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Allowlist (Non-Franchisees)</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add email addresses for non-franchisee users who should have access
          </p>
        </div>

        <div className="p-6">
          <form action={async (formData: FormData) => {
            "use server"
            const email = formData.get("email") as string
            if (email) await addToAllowlist(email)
          }} className="flex gap-2 mb-4">
            <input
              type="email"
              name="email"
              placeholder="email@example.com"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
            />
            <button
              type="submit"
              className="rounded-lg bg-pink-600 px-4 py-2 text-white text-sm hover:bg-pink-700 focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
            >
              Add to Allowlist
            </button>
          </form>

          {allowlistEntries.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {allowlistEntries.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between py-3">
                  <span className="text-sm">{entry.email}</span>
                  <form action={async () => {
                    "use server"
                    await removeFromAllowlist(entry.email)
                  }}>
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-800 text-sm focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
                    >
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No entries in allowlist</p>
          )}
        </div>
      </section>
    </div>
  )
}
