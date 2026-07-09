"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ensureFontsFromCss } from "./fonts";

export default function StyleOverrides() {
  const [css, setCss] = useState("");

  useEffect(() => {
    // Fetch overrides from Supabase
    async function loadOverrides() {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "editorOverrides")
          .single();

        if (error) throw error;

        if (data?.value && typeof data.value === "object") {
          const payload = data.value as any;
          if (payload.css) {
            setCss(payload.css);
            ensureFontsFromCss(payload.css);
          }
        }
      } catch (err) {
        console.warn("No editor overrides found or table missing. Skipping.", err);
      }
    }

    loadOverrides();

    // Subscribe to realtime updates for live preview
    const channel = supabase
      .channel("rt-style-overrides")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings", filter: "key=eq.editorOverrides" },
        (payload: any) => {
          if (payload.new && payload.new.value && typeof payload.new.value === "object") {
            const val = payload.new.value as any;
            if (val.css) {
              setCss(val.css);
              ensureFontsFromCss(val.css);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!css) return null;

  return <style id="canvas-static-overrides" dangerouslySetInnerHTML={{ __html: css }} />;
}
