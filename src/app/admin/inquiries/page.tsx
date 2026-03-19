import { InquiryList } from '@/components/admin/InquiryList'

export default function AdminInquiriesPage() {
  // Placeholder - inquiries table doesn't exist yet (Phase 3)
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buyer Inquiries</h1>
      <InquiryList inquiries={[]} />
    </div>
  )
}
