'use client'

export function FloatingContactCta() {
  function handleClick() {
    const contactSection = document.getElementById('contact')
    contactSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-pink-600 text-white py-3 px-6 rounded-full font-medium shadow-lg hover:bg-pink-700 hover:shadow-xl transition-all"
    >
      Contact Seller
    </button>
  )
}
