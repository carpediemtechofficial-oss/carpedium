type RatingStarsProps = {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
};

export default function RatingStars({ rating, reviewCount, size = "sm", showCount = true }: RatingStarsProps) {
  const sizes = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };
  const textSizes = { sm: "text-[11px]", md: "text-xs", lg: "text-sm" };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const half = !filled && rating >= star - 0.5;
          return (
            <svg key={star} viewBox="0 0 24 24" className={`${sizes[size]} shrink-0`} fill="none">
              {filled ? (
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f59e0b" />
              ) : half ? (
                <>
                  <defs>
                    <linearGradient id={`half-${star}`}>
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#e2e8f0" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={`url(#half-${star})`} />
                </>
              ) : (
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#e2e8f0" />
              )}
            </svg>
          );
        })}
      </div>
      <span className={`font-bold text-amber-500 ${textSizes[size]}`}>{rating.toFixed(1)}</span>
      {showCount && reviewCount !== undefined && (
        <span className={`text-slate-400 ${textSizes[size]}`}>({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
}
