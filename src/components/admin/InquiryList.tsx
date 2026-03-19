interface Inquiry {
  id: string
  buyerName: string
  buyerEmail: string
  listingTitle: string
  message?: string
  createdAt: Date
}

interface InquiryListProps {
  inquiries: Inquiry[]
}

export function InquiryList({ inquiries }: InquiryListProps) {
  if (inquiries.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No inquiries yet.</p>
        <p className="text-sm text-gray-400 mt-1">
          Inquiries will appear here when buyers contact sellers.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
      {inquiries.map(inquiry => (
        <div key={inquiry.id} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-gray-900">{inquiry.buyerName}</p>
              <p className="text-sm text-gray-500">{inquiry.buyerEmail}</p>
            </div>
            <p className="text-sm text-gray-400">
              {new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }).format(new Date(inquiry.createdAt))}
            </p>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Interested in: <span className="font-medium">{inquiry.listingTitle}</span>
          </p>
          {inquiry.message && (
            <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
              {inquiry.message}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
