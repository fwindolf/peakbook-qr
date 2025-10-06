"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

export function Hero() {
  const photoRef = useRef<HTMLDivElement>(null)
  const [clipPath, setClipPath] = useState("")

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    const updateClipPath = () => {
      if (!photoRef.current) return

      const rect = photoRef.current.getBoundingClientRect()
      const { top, left, bottom, right } = rect

      const screenW = window.innerWidth
      const screenH = window.innerHeight

      const p0 = "0px 0px"
      const p1 = `0px ${screenH}px`
      const p2 = `${left}px ${screenH}px`
      const p3 = `${left}px ${top}px`
      const p4 = `${right}px ${top}px`
      const p5 = `${right}px ${bottom}px`
      const p6 = `${left}px ${bottom}px`
      const p7 = `${left}px ${screenH}px`
      const p8 = `${screenW}px ${screenH}px`
      const p9 = `${screenW}px 0px`
      const polygon = `polygon(${p0},${p1},${p2},${p3},${p4},${p5},${p6},${p7},${p8},${p9})`

      setClipPath(polygon)
    }

    updateClipPath()
    window.addEventListener("resize", updateClipPath)
    window.addEventListener("scroll", updateClipPath)

    return () => {
      window.removeEventListener("resize", updateClipPath)
      window.removeEventListener("scroll", updateClipPath)
    }
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#1a1a1a]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <Image
          src="/images/summit-bg.jpg"
          alt="Mountain summit view"
          fill
          className="object-cover"
          priority
        />
        {/* Blurred overlay with clip-path "hole" */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath }}
        >
          <div className="absolute -inset-4">
            <Image
              src="/images/summit-bg.jpg"
              alt="Mountain summit view"
              fill
              className="object-cover blur-sm"
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center px-4">
        {/* Logo */}
        <div className="flex h-[25vh] w-full items-center justify-center">
          <Image
            src="/icons/logo.light.svg"
            alt="Peakbook Logo"
            width={160}
            height={120}
            priority
          />
        </div>

        {/* Photo frame container */}
        <div
          ref={photoRef}
          className="flex aspect-[3/4] h-[50vh] items-center"
        >
          {/* Inner photo frame */}
          <div className="relative h-full w-full overflow-hidden">
            {/* Sharp background image inside frame */}
            <div className="absolute inset-0">
              <Image
                src="/images/summit-bg.jpg"
                alt="Mountain summit view"
                fill
                className="object-cover"
              />
            </div>

            {/* Frame borders (on top of image) */}
            <div className="absolute inset-0 z-10">
              {/* Top border */}
              <div className="absolute inset-x-0 top-0 h-4 bg-white"></div>

              {/* Side borders */}
              <div className="absolute bottom-20 left-0 top-2 w-4 bg-white"></div>
              <div className="absolute bottom-20 right-0 top-2 w-4 bg-white"></div>

              {/* Bottom border with text */}
              <div className="absolute inset-x-0 bottom-0 flex h-24 items-center justify-center bg-white px-4">
                <p className="text-center font-mono text-base font-bold text-[#2c3239] md:text-lg">
                  Capture summits. Share your moment. Stay in touch
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex h-[25vh] w-full items-center justify-center">
          <button
            onClick={scrollToContent}
            className="mb-16 bg-white px-12 py-3 font-mono text-base font-bold text-[#2c3239] transition-all duration-300 hover:bg-gray-200"
          >
            Start Your Collection
          </button>
        </div>
      </div>
    </section>
  )
}
