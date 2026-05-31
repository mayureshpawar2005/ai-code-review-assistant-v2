interface ScoreRingProps {
  score: number;
}

export function ScoreRing({ score }: ScoreRingProps) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80
      ? "stroke-emerald-500"
      : score >= 60
        ? "stroke-amber-500"
        : "stroke-red-500";

  return (
    <div className="relative inline-flex h-32 w-32 items-center justify-center">
      <svg className="-rotate-90" width="128" height="128">
        <circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-700"
        />
        <circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`transition-all duration-700 ${color}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-slate-400">/ 100</span>
      </div>
    </div>
  );
}
