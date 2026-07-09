"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Smartphone, RefreshCw, ExternalLink } from "lucide-react";

type PreviewPanelProps = {
  anchor?: string;
};

export default function PreviewPanel({ anchor }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const syncScrollPosition = () => {
    if (anchor && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "PREVIEW_SCROLL", anchor },
        "*"
      );
    }
  };

  useEffect(() => {
    // Sync scroll position when anchor updates
    syncScrollPosition();
  }, [anchor]);

  // Setup ready listener
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "PREVIEW_READY") {
        syncScrollPosition();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [anchor]);

  return (
    <div className="h-full border border-slate-200 rounded-xl overflow-hidden bg-slate-900 text-slate-100 flex flex-col">
      {/* Device Toolbar */}
      <div className="h-12 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
          </span>
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Live Preview</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Device toggle */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded p-0.5">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1 rounded transition-colors ${device === "desktop" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-1 rounded transition-colors ${device === "mobile" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={() => {
              if (iframeRef.current) iframeRef.current.src = "/?preview=1";
            }}
            className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="Reload Preview"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {/* Open external */}
          <a
            href="/?preview=1"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="Open in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Frame view */}
      <div className="flex-1 bg-slate-900 p-4 flex justify-center items-start overflow-auto">
        <div className={`h-full border border-slate-805 bg-white rounded-lg shadow-2xl transition-all duration-300 ${device === "mobile" ? "w-[340px]" : "w-full"} overflow-hidden`}>
          <iframe
            ref={iframeRef}
            src="/?preview=1"
            className="w-full h-full border-none bg-white"
            title="Workspace Live Frame"
            onLoad={syncScrollPosition}
          />
        </div>
      </div>
    </div>
  );
}
