"use client";

import { playTick } from "@/lib/sound";
import { useSettings } from "@/hooks/useSettings";
import DeveloperCredit from "./DeveloperCredit";

const TECHNICAL_SERVICES = [
  { href: "#courses", label: "AIoT (AI + IoT Solutions)" },
  { href: "#courses", label: "Web & Mobile App Dev" },
  { href: "#courses", label: "Custom Software Dev" },
  { href: "#courses", label: "Cloud Computing & DevOps" },
  { href: "#courses", label: "UI/UX Prototyping" }
];

const BUSINESS_SOLUTIONS = [
  { href: "#courses", label: "Zoho & GST Integrations" },
  { href: "#courses", label: "Financial Automation" },
  { href: "#courses", label: "Edge Computing & Gen AI" },
  { href: "#courses", label: "Digital Marketing" },
  { href: "#courses", label: "SEO & SEM Optimization" }
];

type FooterColumnProps = {
  title: string;
  links: { href: string; label: string }[];
};

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-teal-600 font-bold">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

type IconProps = React.SVGProps<SVGSVGElement>;

const IconLinkedin = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
  </svg>
);
const IconGithub = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);
const IconX = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);
const IconInstagram = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const IconYoutube = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.5 15.5v-7l6.3 3.5Z" />
  </svg>
);

const SOCIAL_PLATFORMS = [
  { key: "linkedin", label: "LinkedIn", Icon: IconLinkedin },
  { key: "github", label: "GitHub", Icon: IconGithub },
  { key: "twitter", label: "X (Twitter)", Icon: IconX },
  { key: "instagram", label: "Instagram", Icon: IconInstagram },
  { key: "youtube", label: "YouTube", Icon: IconYoutube },
] as const;

type FooterProps = {
  onAdminClick?: () => void;
};

export default function Footer({ onAdminClick }: FooterProps) {
  const { settings } = useSettings();
  const { contact, social, branding, footer } = settings;

  return (
    <footer className="relative border-t border-slate-800 bg-slate-950 text-slate-300 px-6 pt-16 pb-8">
      {/* Background Subtle Green Radial Glow */}
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-teal-500/5 blur-[100px] pointer-events-none z-0" />

      <div className="mx-auto max-w-6xl relative z-10">
        
        {/* Columns Grid */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={branding.logo}
                alt={branding.brandName}
                width={34}
                height={34}
                className="rounded-full border border-slate-800 select-none bg-white"
              />
              <p className="font-display text-sm font-bold text-white tracking-wide">
                {branding.brandName}
              </p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
              {footer.tagline || "Providing hands-on technology training, certification, and corporate digital solutions."}
            </p>
          </div>
          
          <FooterColumn title="Technical Services" links={TECHNICAL_SERVICES} />
          <FooterColumn title="Business Solutions" links={BUSINESS_SOLUTIONS} />
          
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-teal-600 font-bold">Contact Us</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li className="text-slate-400">{contact.address}</li>
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className="text-slate-400 hover:text-white transition-colors">
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.phone && (
                <li>
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="text-slate-400 hover:text-white transition-colors">
                    {contact.phone}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-10 flex flex-col gap-6 border-t border-slate-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6 text-xs text-slate-500 font-mono">
            {onAdminClick && (
              <button
                type="button"
                onClick={() => {
                  playTick();
                  onAdminClick();
                }}
                className="hover:text-teal-500 font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Admin Portal
              </button>
            )}
            <span>
              © {new Date().getFullYear()} {footer.copyright}
            </span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-2.5">
            {SOCIAL_PLATFORMS.map(({ key, label, Icon }) => {
              const href = (social as Record<string, string>)[key];
              const base = "h-9 w-9 rounded-full border flex items-center justify-center transition-all";
              return href ? (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  onMouseEnter={playTick}
                  className={`${base} border-slate-700 text-slate-300 hover:text-white hover:border-teal-500 hover:bg-teal-500/10 hover:-translate-y-0.5`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ) : (
                <span
                  key={key}
                  aria-label={`${label} (not configured)`}
                  title={`${label} — add the URL in Settings → Social Links`}
                  className={`${base} border-slate-800 text-slate-600`}
                >
                  <Icon className="h-4 w-4" />
                </span>
              );
            })}
          </div>
        </div>

        {/* Developer Credit */}
        <DeveloperCredit />

      </div>
    </footer>
  );
}
