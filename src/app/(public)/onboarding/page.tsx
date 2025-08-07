// app/(public)/onboarding/page.tsx

import Link from 'next/link'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="bg-gray-100 py-20 text-center px-4">
        <h1 className="text-4xl font-bold mb-4">
          Create & Share Your Digital Restaurant Menu in Minutes
        </h1>
        <p className="text-lg mb-8">
          No app download needed. Works on TV screens & smartphones.
        </p>
        <Link href="/signup">
          <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition">
            Create My Menu →
          </button>
        </Link>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-10 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="font-semibold text-xl mb-2">Step 1</h3>
            <p>Register your restaurant with a few clicks.</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="font-semibold text-xl mb-2">Step 2</h3>
            <p>Build your menu with images and descriptions.</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📲</div>
            <h3 className="font-semibold text-xl mb-2">Step 3</h3>
            <p>Share QR code or TV link with customers.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20 px-6">
        <h2 className="text-2xl font-semibold text-center mb-10">Features</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {[
            'No app required – just a link',
            'Works on mobile & smart TV',
            'Upload food images',
            'Shareable unique link',
            'Downloadable QR Code',
            'Live updates to your menu',
          ].map((feature, i) => (
            <div key={i} className="bg-white p-6 shadow rounded">
              ✅ {feature}
            </div>
          ))}
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-20 text-center px-4">
        <h2 className="text-2xl font-semibold mb-4">See a Live Demo</h2>
        <p className="mb-6">Explore how your digital menu will look.</p>
        <Link href="/menu/demo-restaurant">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            View Demo Menu →
          </button>
        </Link>
      </section>

      {/* CTA Footer */}
      <section className="bg-black text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Create Your Menu?</h2>
        <p className="mb-6">It’s free, simple and fast to get started.</p>
        <Link href="/signup">
          <button className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition">
            Get Started →
          </button>
        </Link>
      </section>
    </div>
  )
}
