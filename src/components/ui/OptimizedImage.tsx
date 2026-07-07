import { useState, useEffect } from "react";
import Skeleton from "./Skeleton";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: string;
  className?: string;
}

export default function OptimizedImage({ src, fallback = "", className = "", ...props }: OptimizedImageProps) {
  const [loading, setLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setError(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    setCurrentSrc(src);
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && !error && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-inherit bg-slate-200" />
      )}
      {currentSrc && !error && (
        <img
          src={currentSrc}
          loading="lazy"
          onLoad={() => setLoading(false)}
          onError={() => {
            if (fallback && currentSrc !== fallback) {
              setCurrentSrc(fallback);
            } else {
              setError(true);
              setLoading(false);
            }
          }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
          {...props}
        />
      )}
      {(error || !currentSrc) && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
}
