import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { AppScreenshots } from "@/components/landing/app-screenshots"
import { WaitlistForm } from "@/components/landing/waitlist-form"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Features />
      <AppScreenshots />
      <WaitlistForm />
      <Footer />
    </main>
  )
}
