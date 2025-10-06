import Link from "next/link"
import { Linkedin, Globe } from "lucide-react"

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-block font-mono text-sm text-gray-600 hover:text-[#2c3239]"
        >
          ← Back to Home
        </Link>

        <h1 className="mb-8 font-mono text-4xl font-bold text-[#2c3239]">
          Impressum
        </h1>

        <div className="space-y-8 font-mono text-[#2c3239]">
          <section>
            <h2 className="mb-4 text-2xl font-bold">
              Information according to § 5 TMG
            </h2>
            <p className="text-gray-700">
              Florian Windolf
              <br />
              peakbook
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">Contact</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                Email:{" "}
                <a
                  href="mailto:contact@peakbook.app"
                  className="text-[#2c3239] underline hover:no-underline"
                >
                  contact@peakbook.app
                </a>
              </p>
              <div className="mt-4 flex gap-4">
                <a
                  href="https://www.linkedin.com/in/fwindolf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#2c3239] hover:underline"
                >
                  <Linkedin className="h-5 w-5" />
                  LinkedIn
                </a>
                <a
                  href="https://fwindolf.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#2c3239] hover:underline"
                >
                  <Globe className="h-5 w-5" />
                  Portfolio
                </a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">
              Responsible for content according to § 55 Abs. 2 RStV
            </h2>
            <p className="text-gray-700">Florian Windolf</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">Liability for Content</h2>
            <p className="text-gray-700">
              As a service provider, we are responsible for our own content on
              these pages in accordance with general legislation pursuant to
              Section 7 (1) of the German Telemedia Act (TMG). However,
              according to Sections 8 to 10 TMG, we are not obligated to monitor
              transmitted or stored third-party information or to investigate
              circumstances that indicate illegal activity.
            </p>
            <p className="mt-4 text-gray-700">
              Obligations to remove or block the use of information under general
              law remain unaffected. However, liability in this regard is only
              possible from the time of knowledge of a specific legal violation.
              Upon becoming aware of corresponding legal violations, we will
              remove this content immediately.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">Liability for Links</h2>
            <p className="text-gray-700">
              Our website contains links to external third-party websites over
              whose content we have no influence. Therefore, we cannot assume any
              liability for this external content. The respective provider or
              operator of the pages is always responsible for the content of the
              linked pages. The linked pages were checked for possible legal
              violations at the time of linking. Illegal content was not
              recognizable at the time of linking.
            </p>
            <p className="mt-4 text-gray-700">
              However, permanent monitoring of the content of the linked pages is
              not reasonable without concrete evidence of a legal violation. Upon
              becoming aware of legal violations, we will remove such links
              immediately.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">Copyright</h2>
            <p className="text-gray-700">
              The content and works created by the site operators on these pages
              are subject to German copyright law. Duplication, processing,
              distribution, and any kind of exploitation outside the limits of
              copyright require the written consent of the respective author or
              creator. Downloads and copies of this site are only permitted for
              private, non-commercial use.
            </p>
            <p className="mt-4 text-gray-700">
              Insofar as the content on this site was not created by the
              operator, the copyrights of third parties are respected. In
              particular, third-party content is marked as such. Should you
              nevertheless become aware of a copyright infringement, please inform
              us accordingly. Upon becoming aware of legal violations, we will
              remove such content immediately.
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-500">
            Last updated: October 2025
          </p>
        </div>
      </div>
    </div>
  )
}
