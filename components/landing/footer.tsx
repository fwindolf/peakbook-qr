import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[#1a1a1a] py-12 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <p className="font-mono text-sm text-gray-400">
              © {new Date().getFullYear()} Peakbook. All rights reserved.
            </p>
          </div>

          <div className="flex gap-6">
            <Link
              href="/impressum"
              className="font-mono text-sm text-gray-400 hover:text-white"
            >
              Impressum
            </Link>
            <a
              href="mailto:contact@peakbook.app"
              className="font-mono text-sm text-gray-400 hover:text-white"
            >
              Contact
            </a>
            <Link
              href="/admin"
              className="font-mono text-sm text-gray-400 hover:text-white"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
