export function Features() {
  return (
    <section className="bg-white py-24 text-[#2c3239]">
      <div className="container mx-auto px-4">
        <h2 className="mb-16 text-center font-mono text-4xl font-bold">
          Your Summit Stories, Preserved
        </h2>

        <div className="grid gap-12 md:grid-cols-3">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2c3239] text-3xl text-white">
                🏔️
              </div>
            </div>
            <h3 className="mb-4 font-mono text-xl font-bold">
              Capture Every Peak
            </h3>
            <p className="font-mono text-gray-600">
              Scan QR codes at summit books to instantly capture your achievement
              and share your moment with the hiking community.
            </p>
          </div>

          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2c3239] text-3xl text-white">
                📸
              </div>
            </div>
            <h3 className="mb-4 font-mono text-xl font-bold">
              Share Your Journey
            </h3>
            <p className="font-mono text-gray-600">
              Add photos and captions to document your experience. Build a
              collection of memories from every summit you conquer.
            </p>
          </div>

          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2c3239] text-3xl text-white">
                🌍
              </div>
            </div>
            <h3 className="mb-4 font-mono text-xl font-bold">
              Connect with Hikers
            </h3>
            <p className="font-mono text-gray-600">
              Join a community of mountain enthusiasts. See who else has been
              there and discover new peaks to explore.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
