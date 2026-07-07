import { useEffect, useRef } from "react";

// ============================================================
// DeveloperCredit — obfuscated, self-healing attribution.
//
// The credit text/link is stored as a 5-layer encoded blob (not a
// plain editable string) and rendered at runtime. A guard restores it
// if it is removed or altered in the DOM, and reports tamper attempts.
//
// NOTE: This is client-side, so it is a strong deterrent — not
// unbreakable. Anyone with the source can still remove the component.
// The email alert is sent via EmailJS when configured (see below).
// ============================================================

// 5-layer blob: JSON → b64 → reverse → b64 → reverse → b64
const BLOB =
  "PVVXZUtOWFNxOVdhU2RrVjZGMlZrVm5XWEYxWlo1MmFweDBRS1ZYU3E5V2FSaGxTeElXYUNGVldYVnphaGRsUjFsVWEzbFdZRGxrTkoxR2F3UUdTQ3AzVHBoamRaaGxTeElXYXhjWFdYVnphaGRsUjF4VWIxd0daSGhIY2E1MmExbEZXQ2RIVDVwVU8=";

const rev = (s: string) => s.split("").reverse().join("");

function decode(blob: string): { l: string; n: string; h: string } {
  try {
    let x = atob(blob);      // undo L5
    x = rev(x);              // undo L4
    x = atob(x);             // undo L3
    x = rev(x);              // undo L2
    x = atob(x);             // undo L1
    return JSON.parse(x);
  } catch {
    return { l: "Designed by", n: "Arun Pandian", h: "https://arun-pandian.netlify.app/" };
  }
}

const DATA = decode(BLOB);

// Report a tamper attempt. Uses EmailJS REST if configured (public IDs),
// otherwise falls back to a webhook, otherwise logs to the console.
let lastReport = 0;
function reportTamper(reason: string) {
  const now = Date.now();
  if (now - lastReport < 60_000) return; // throttle to 1/min
  lastReport = now;

  const payload = {
    to_email: "arunpandi47777@gmail.com",
    subject: "Attribution tamper detected",
    message: `The "${DATA.l} ${DATA.n}" footer credit was ${reason}.`,
    page_url: typeof location !== "undefined" ? location.href : "",
    time: new Date().toISOString(),
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    reason,
  };

  const env = (import.meta as any).env || {};
  const svc = env.VITE_EMAILJS_SERVICE_ID;
  const tpl = env.VITE_EMAILJS_TEMPLATE_ID;
  const pub = env.VITE_EMAILJS_PUBLIC_KEY;
  const webhook = env.VITE_ATTRIBUTION_ALERT_URL;

  try {
    if (svc && tpl && pub) {
      fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_id: svc, template_id: tpl, user_id: pub, template_params: payload }),
        keepalive: true,
      }).catch(() => {});
    } else if (webhook) {
      // Prefer sendBeacon so it survives navigation/unload
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) navigator.sendBeacon(webhook, body);
      else fetch(webhook, { method: "POST", body, keepalive: true }).catch(() => {});
    } else {
      console.warn("[attribution] tamper detected but no alert channel configured:", payload);
    }
  } catch {
    /* swallow */
  }
}

function creditHTML(): string {
  // Built imperatively so the string is not a plain literal in the JSX.
  return (
    `<p class="text-[11px] text-slate-500 font-mono">` +
    `${DATA.l} ` +
    `<a href="${DATA.h}" target="_blank" rel="noopener noreferrer" ` +
    `data-dev-credit="1" class="text-teal font-bold hover:text-teal-bright transition-colors">` +
    `${DATA.n}</a></p>`
  );
}

function isIntact(host: HTMLElement): boolean {
  const link = host.querySelector<HTMLAnchorElement>('a[data-dev-credit="1"]');
  if (!link) return false;
  if (link.getAttribute("href") !== DATA.h) return false;
  if ((link.textContent || "").trim() !== DATA.n) return false;
  if (!(host.textContent || "").includes(DATA.l)) return false;
  return true;
}

export default function DeveloperCredit() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const parent = host.parentNode as HTMLElement | null;

    const restore = (reason: string) => {
      if (host.innerHTML !== creditHTML()) host.innerHTML = creditHTML();
      // If the host itself was detached, re-attach it where it belongs.
      if (parent && !parent.contains(host)) parent.appendChild(host);
      reportTamper(reason);
    };

    // Initial render (imperative — keeps React out of this node's children).
    host.innerHTML = creditHTML();

    const observer = new MutationObserver(() => {
      if (!isIntact(host)) restore("modified");
    });
    observer.observe(host, { childList: true, subtree: true, characterData: true, attributes: true });
    if (parent) observer.observe(parent, { childList: true });

    // Fallback poll catches full removal / observer teardown.
    const interval = window.setInterval(() => {
      if (!document.contains(host)) restore("removed");
      else if (!isIntact(host)) restore("modified");
    }, 4000);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
      {/* Populated & guarded imperatively by the effect above */}
      <div ref={hostRef} />
    </div>
  );
}
