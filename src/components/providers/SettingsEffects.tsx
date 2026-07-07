import { useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";

// Applies live website settings to the document:
//  - brand colors → CSS variables consumed by the whole UI
//  - SEO title / meta description
//  - favicon
// Rendered once near the app root so any Settings save reflects instantly.
export default function SettingsEffects() {
  const { settings } = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    const { primaryColor, primaryLight, primaryStrong, favicon } = settings.branding;

    if (primaryColor) {
      root.style.setProperty("--color-primary", primaryColor);
      root.style.setProperty("--primary", primaryColor);
      root.style.setProperty("--ring", primaryColor);
    }
    if (primaryLight) root.style.setProperty("--color-primary-light", primaryLight);
    if (primaryStrong) root.style.setProperty("--color-primary-strong", primaryStrong);
    if (primaryColor) {
      root.style.setProperty("--color-teal", primaryColor);
      root.style.setProperty("--color-teal-bright", primaryLight || primaryColor);
    }

    if (favicon) {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = favicon;
    }
  }, [settings.branding]);

  useEffect(() => {
    if (settings.seo.title) document.title = settings.seo.title;
    if (settings.seo.description) {
      let meta = document.querySelector<HTMLMetaElement>("meta[name='description']");
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = settings.seo.description;
    }
  }, [settings.seo]);

  return null;
}
