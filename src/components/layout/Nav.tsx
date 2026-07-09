"use client";

import { useState } from "react";
import { scrollToSection } from "@/lib/scroll";
import { useScrollUpOrTop } from "@/lib/useScrollDirection";
import TopBar from "./TopBar";
import { getMuteState, setMuteState, playTick } from "@/lib/sound";
import { useSettings } from "@/hooks/useSettings";

const LINKS = [
  { href: "#courses", label: "Courses" },
  { href: "#about", label: "About" },
  { href: "#strategy", label: "Strategy" },
  { href: "#collaborations", label: "Collaborations" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#contact", label: "Contact" },
];

type NavProps = {
  activeSection: string;
  onEnrollClick: () => void;
};

export default function Nav({ activeSection, onEnrollClick }: NavProps) {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(getMuteState());
  const topBarVisible = useScrollUpOrTop();
  const { settings } = useSettings();

  const toggleMute = () => {
    const nextMute = !muted;
    setMuted(nextMute);
    setMuteState(nextMute);
    if (!nextMute) {
      setTimeout(() => playTick(), 50);
    }
  };

  const handleClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollToSection(href);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-teal/10 bg-white/70 backdrop-blur-md">
      <TopBar visible={topBarVisible} />
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#hero"
          onClick={handleClick("#hero")}
          onMouseEnter={playTick}
          className="flex items-center gap-2.5 font-display text-sm font-bold tracking-wider text-ink transition-transform hover:scale-[1.02] shrink-0"
        >
          <img
            src={settings.branding.logo}
            alt={settings.branding.brandName}
            width={32}
            height={32}
            className="rounded-full ring-2 ring-primary/20 shrink-0"
          />
          <span 
            data-edit-id="nav-brand-name"
            data-edit-name="Brand Name"
            data-edit-kind="text"
            data-edit-path="branding.brandName"
            className="hidden sm:inline font-mono tracking-widest text-[11px] md:text-[13px] uppercase whitespace-nowrap"
          >
            {settings.branding.brandName}
          </span>
        </a>

        {/* Desktop Links */}
        <ul className="hidden items-center gap-4 lg:gap-7 md:flex shrink-0">
          {LINKS.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={handleClick(link.href)}
                  onMouseEnter={playTick}
                  className={`relative py-1 font-mono text-[11px] uppercase tracking-wider transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100 ${
                    isActive ? "text-primary font-bold after:scale-x-100" : "text-ink-dim hover:text-primary"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* CTA */}
        <div className="hidden items-center gap-4 md:flex shrink-0">
          <button
            onClick={() => {
              playTick();
              onEnrollClick();
            }}
            data-edit-id="nav-enroll-btn"
            data-edit-name="Nav Enroll Button"
            data-edit-kind="button"
            data-edit-path="branding.enrollCta"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-primary-light hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer whitespace-nowrap shrink-0"
          >
            {settings.branding.enrollCta || "Enroll Now"}
          </button>
        </div>

        {/* Mobile hamburger only */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            onMouseEnter={playTick}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-teal/20 text-ink transition-colors hover:bg-primary/5 hover:text-primary"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              {open ? (
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-teal/10 bg-white/95 px-6 py-6 shadow-xl md:hidden">
          <ul id="mobile-nav" className="flex flex-col gap-2">
            {LINKS.map((link) => {
              const isActive = activeSection === link.href.slice(1);
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={handleClick(link.href)}
                    onMouseEnter={playTick}
                    className={`block py-2.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                      isActive ? "text-primary font-bold" : "text-ink-dim hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
            <li className="mt-2 pt-2">
              <button
                onClick={() => {
                  playTick();
                  setOpen(false);
                  onEnrollClick();
                }}
                className="flex w-full items-center justify-center rounded-full bg-primary py-3 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-primary-light cursor-pointer"
              >
                Enroll Now
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
