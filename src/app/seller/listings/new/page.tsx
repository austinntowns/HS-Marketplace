import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ListingWizard } from '@/components/listings/ListingWizard'

export default async function NewListingPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Listing</h1>
      <p className="text-gray-500 mb-8">
        List your Hello Sugar location for sale. Your listing will be reviewed before going live.
      </p>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <ListingWizard userId={session.user.id} />
      </div>
    </div>
  )
}
