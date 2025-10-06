export function AppScreenshots() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-24 text-[#2c3239]">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 text-center font-mono text-4xl font-bold">
          Experience Peakbook
        </h2>
        <p className="mb-16 text-center font-mono text-lg text-gray-600">
          Available soon on iOS and Android
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Screenshot placeholder 1 */}
          <div className="flex flex-col items-center">
            <div className="mb-4 flex aspect-[9/19.5] w-full max-w-xs items-center justify-center rounded-3xl border-4 border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl">
              <div className="text-center">
                <div className="mb-2 text-6xl">📱</div>
                <p className="font-mono text-sm text-gray-500">
                  Screenshot placeholder
                </p>
                <p className="font-mono text-xs text-gray-400">
                  Scan QR codes
                </p>
              </div>
            </div>
            <p className="font-mono text-sm font-semibold">
              Scan at Summit Books
            </p>
          </div>

          {/* Screenshot placeholder 2 */}
          <div className="flex flex-col items-center">
            <div className="mb-4 flex aspect-[9/19.5] w-full max-w-xs items-center justify-center rounded-3xl border-4 border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl">
              <div className="text-center">
                <div className="mb-2 text-6xl">🏔️</div>
                <p className="font-mono text-sm text-gray-500">
                  Screenshot placeholder
                </p>
                <p className="font-mono text-xs text-gray-400">
                  Track your peaks
                </p>
              </div>
            </div>
            <p className="font-mono text-sm font-semibold">
              Build Your Collection
            </p>
          </div>

          {/* Screenshot placeholder 3 */}
          <div className="flex flex-col items-center">
            <div className="mb-4 flex aspect-[9/19.5] w-full max-w-xs items-center justify-center rounded-3xl border-4 border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl">
              <div className="text-center">
                <div className="mb-2 text-6xl">📸</div>
                <p className="font-mono text-sm text-gray-500">
                  Screenshot placeholder
                </p>
                <p className="font-mono text-xs text-gray-400">
                  Share moments
                </p>
              </div>
            </div>
            <p className="font-mono text-sm font-semibold">
              Share Your Moments
            </p>
          </div>
        </div>

        <p className="mt-12 text-center font-mono text-sm text-gray-500">
          Replace these placeholders with actual app screenshots
        </p>
      </div>
    </section>
  )
}
