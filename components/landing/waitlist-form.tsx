"use client"

import { useState } from "react"

export function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Thanks for joining! We'll keep you updated.")
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error || "Something went wrong. Please try again.")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Failed to join waitlist. Please try again.")
    }
  }

  return (
    <section id="waitlist" className="bg-[#2c3239] py-24 text-white">
      <div className="container mx-auto max-w-2xl px-4">
        <h2 className="mb-6 text-center font-mono text-4xl font-bold">
          Join the Waitlist
        </h2>
        <p className="mb-12 text-center font-mono text-lg text-gray-300">
          Be the first to know when Peakbook launches. Get early access and
          exclusive updates.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto max-w-md">
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block font-mono text-sm">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full border-2 border-white bg-transparent px-4 py-3 font-mono text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full border-2 border-white bg-white px-8 py-3 font-mono font-bold text-[#2c3239] transition-all duration-300 hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? "Joining..." : "Join Waitlist"}
          </button>

          {message && (
            <p
              className={`mt-4 text-center font-mono text-sm ${
                status === "success" ? "text-green-300" : "text-red-300"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
