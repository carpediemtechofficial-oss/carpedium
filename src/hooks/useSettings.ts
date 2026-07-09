// ============================================================
// useSettings — live website settings sourced from Supabase.
//
// Settings are stored in the `settings` table as (key, value JSONB)
// rows, one row per section. This hook merges them over sane defaults
// (the values the site originally shipped with) and subscribes to
// realtime changes so edits in Admin → Settings apply live.
// ============================================================

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type SiteSettings = {
  branding: {
    logo: string;
    favicon: string;
    brandName: string;
    primaryColor: string;
    primaryLight: string;
    primaryStrong: string;
    headingFont?: string;
    bodyFont?: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
  };
  social: {
    linkedin: string;
    github: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
  footer: {
    tagline: string;
    copyright: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  stats: {
    courses: string;
    students: string;
    rating: string;
    placement: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  layout?: {
    sections: { id: string; name: string; visible: boolean }[];
  };
  custom_elements?: Record<string, any>;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  branding: {
    logo: "/logo/carpediem-mark.jpg",
    favicon: "/logo/carpediem-mark.jpg",
    brandName: "CARPEDIEM TECH",
    primaryColor: "#14b8a6",
    primaryLight: "#2dd4bf",
    primaryStrong: "#0f766e",
  },
  contact: {
    email: "carpediemtechinnovations@gmail.com",
    phone: "+91 73395 12373",
    whatsapp: "917339512373",
    address: "Coimbatore, Tamil Nadu",
  },
  social: {
    linkedin: "https://linkedin.com/in/carpediem-tech-innovations",
    github: "",
    twitter: "",
    instagram: "",
    youtube: "",
  },
  footer: {
    tagline: "Serving learners across Coimbatore",
    copyright: "Carpediem Tech Innovations.",
  },
  hero: {
    eyebrow: "Coimbatore's Premier Software Engineering Academy",
    title: "Build What's Next. The Skills Behind Tomorrow's Technology.",
    subtitle:
      "Master Full-Stack Development, Artificial Intelligence, Cloud Computing, and Cybersecurity through project-based learning, expert mentorship, internships, and industry-recognized certifications.",
  },
  stats: {
    courses: "12+",
    students: "7,500+",
    rating: "4.8 ★",
    placement: "89%",
  },
  seo: {
    title: "Carpediem Tech Innovations — Full-Stack & Gen AI Training, Coimbatore",
    description:
      "Production-grade software engineering, AI, cloud, and design programs with mentor-led cohorts and placement support.",
    keywords: "tech training, full stack, AI, cloud, coimbatore, bootcamp",
  },
  layout: {
    sections: [
      { id: "hero", name: "Hero", visible: true },
      { id: "about", name: "About Us", visible: true },
      { id: "trust", name: "Trust Strip", visible: true },
      { id: "courses", name: "Course Catalog", visible: true },
      { id: "why", name: "Why Carpediem", visible: true },
      { id: "strategy", name: "Our Strategy", visible: true },
      { id: "collaborations", name: "Collaborations", visible: true },
      { id: "programs", name: "Programs", visible: true },
      { id: "how", name: "How It Works", visible: true },
      { id: "projects", name: "Live Projects", visible: true },
      { id: "certifications", name: "Certifications", visible: true },
      { id: "mentors", name: "Mentors", visible: true },
      { id: "outcomes", name: "Outcomes", visible: true },
      { id: "testimonials", name: "Testimonials", visible: true },
      { id: "partners", name: "Partners", visible: true },
      { id: "faqs", name: "FAQs", visible: true },
      { id: "blog", name: "Blog", visible: true },
      { id: "resources", name: "Resources", visible: true },
      { id: "contact", name: "Contact", visible: true }
    ]
  }
};

export const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[];

type SettingsRow = { key: string; value: Record<string, unknown> };

function mergeSettings(rows: SettingsRow[] | undefined): SiteSettings {
  const merged: SiteSettings = structuredClone(DEFAULT_SETTINGS);
  if (!rows) return merged;
  for (const row of rows) {
    if (row.key in merged && row.value && typeof row.value === "object") {
      Object.assign(
        merged[row.key as keyof SiteSettings] as Record<string, unknown>,
        row.value
      );
    } else if (row.key === "site_settings" && row.value && typeof row.value === "object") {
      merged.custom_elements = (row.value as any).custom_elements || {};
    } else if (row.key === "custom_elements" && row.value && typeof row.value === "object") {
      merged.custom_elements = row.value;
    }
  }
  return merged;
}

// Helper to merge live drafts into settings
function mergeDrafts(settings: SiteSettings, drafts: any): SiteSettings {
  if (!drafts) return settings;
  const merged = structuredClone(settings);
  for (const [sectionKey, fields] of Object.entries(drafts)) {
    if (fields && typeof fields === "object") {
      if (sectionKey === "site_settings" || sectionKey === "custom_elements") {
        merged.custom_elements = {
          ...(merged.custom_elements || {}),
          ...((fields as any).custom_elements || fields)
        };
      } else {
        if (!merged[sectionKey as keyof SiteSettings]) {
          (merged as any)[sectionKey] = {};
        }
        Object.assign(
          merged[sectionKey as keyof SiteSettings] as Record<string, unknown>,
          fields
        );
      }
    }
  }
  return merged;
}

// Global listener registry for real-time postMessage preview sync
let globalPreviewContent: any = null;
const previewListeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("message", (event) => {
    if (event.data?.type === "PREVIEW_OVERRIDE") {
      globalPreviewContent = event.data.content;
      previewListeners.forEach((listener) => listener());
    }
  });
}

import { useState } from "react";

export function useSettings() {
  const queryClient = useQueryClient();
  const [livePreviewContent, setLivePreviewContent] = useState(globalPreviewContent);

  useEffect(() => {
    const handler = () => {
      setLivePreviewContent(globalPreviewContent);
    };
    previewListeners.add(handler);
    return () => {
      previewListeners.delete(handler);
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`rt-settings-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        () => queryClient.invalidateQueries({ queryKey: ["site-settings"] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("key, value");
      if (error) throw error;
      return mergeSettings(data as SettingsRow[]);
    },
  });

  const baseSettings = query.data ?? DEFAULT_SETTINGS;
  const mergedSettings = livePreviewContent
    ? mergeDrafts(baseSettings, livePreviewContent)
    : baseSettings;

  return { settings: mergedSettings, isLoading: query.isLoading };
}

