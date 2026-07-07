"use client";

import { useState } from "react";

const WHATSAPP_URL =
  "https://wa.me/917339512373?text=Hello%2C%20I%20would%20like%20to%20know%20more%20about%20this%20course.";

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3">
      <span
        className={`hidden sm:inline-block rounded-full bg-white/85 backdrop-blur-md border border-teal/15 px-3.5 py-2 text-xs font-mono text-ink shadow-md transition-all duration-200 ${
          hovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
        }`}
      >
        Chat with us
      </span>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Carpediem Tech Innovations on WhatsApp"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="motion-safe:animate-glow-pulse flex h-14 w-14 items-center justify-center rounded-full bg-primary text-ink shadow-card-hover transition-transform duration-200 hover:scale-105 hover:bg-primary-light"
      >
        <svg
          viewBox="0 0 32 32"
          width="26"
          height="26"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M16.001 3C9.096 3 3.5 8.596 3.5 15.5c0 2.36.653 4.566 1.789 6.452L3 29l7.24-2.235A12.44 12.44 0 0 0 16.001 28C22.906 28 28.5 22.404 28.5 15.5S22.906 3 16.001 3Zm0 22.6a10.06 10.06 0 0 1-5.14-1.41l-.369-.219-4.298 1.327 1.36-4.187-.24-.384a10.06 10.06 0 0 1-1.554-5.227c0-5.578 4.54-10.1 10.041-10.1 5.5 0 10.04 4.522 10.04 10.1s-4.54 10.1-10.04 10.1Zm5.516-7.55c-.302-.152-1.789-.883-2.066-.984-.277-.101-.479-.152-.68.152-.202.303-.782.984-.958 1.187-.176.202-.353.227-.655.076-.302-.152-1.276-.47-2.431-1.502-.899-.802-1.506-1.793-1.682-2.096-.176-.303-.019-.466.133-.617.136-.136.302-.353.454-.53.151-.176.201-.303.302-.505.101-.202.05-.379-.025-.53-.076-.152-.68-1.638-.932-2.244-.245-.588-.494-.509-.68-.518-.176-.008-.377-.01-.579-.01-.201 0-.529.076-.806.379-.277.303-1.058 1.034-1.058 2.522s1.083 2.925 1.234 3.127c.151.202 2.132 3.256 5.166 4.566.722.312 1.286.498 1.726.637.725.23 1.385.198 1.907.12.582-.087 1.789-.731 2.041-1.437.252-.706.252-1.31.176-1.437-.076-.126-.277-.202-.579-.354Z" />
        </svg>
      </a>
    </div>
  );
}
