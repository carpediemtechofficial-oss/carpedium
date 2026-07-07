import { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  chartData?: number[];
};

export default function StatCard({ label, value, icon: Icon, color, bg, trend, chartData }: StatCardProps) {
  return (
    <div className="relative group bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Premium Gradient Border Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <h3 className="text-3xl font-display font-extrabold text-slate-900 leading-tight">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className={trend.isPositive ? "text-emerald-600" : "text-rose-600"}>
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </span>
              <span className="text-slate-400">vs last month</span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* Mini Trend Sparkline Chart */}
      {chartData && chartData.length > 0 && (
        <div className="mt-4 h-8 w-full flex items-end gap-1 overflow-hidden pointer-events-none">
          {chartData.map((val, idx) => {
            const max = Math.max(...chartData, 1);
            const pct = (val / max) * 100;
            return (
              <div
                key={idx}
                className={`flex-1 rounded-t-sm transition-all duration-500 ${
                  trend?.isPositive ? "bg-teal-500/30 group-hover:bg-teal-500" : "bg-rose-500/30 group-hover:bg-rose-500"
                }`}
                style={{ height: `${Math.max(15, pct)}%` }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
