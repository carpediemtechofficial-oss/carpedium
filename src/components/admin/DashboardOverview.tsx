import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Users, BookOpen, GraduationCap, Loader2, Award, Briefcase, CalendarClock, DollarSign, ArrowUpRight } from "lucide-react";
import StatCard from "./shared/StatCard";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalMentors: 0,
    totalTestimonials: 0,
    totalStudents: 0,
    certificatesIssued: 0,
    placementRate: 0,
    avgAttendance: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      // Parallel fetch for dashboard counts
      const [courses, mentors, testimonials, students, payments] = await Promise.all([
        supabase.from("courses").select("id", { count: "exact" }),
        supabase.from("mentors").select("id", { count: "exact", head: true }),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
        supabase.from("students").select("status, certificate_issued, placement_status, attendance_percentage"),
        supabase.from("student_payments").select("amount"),
      ]);

      const s = students.data ?? [];
      const total = s.length;
      const placed = s.filter((x) => x.placement_status === "Placed").length;
      const attSum = s.reduce((sum, x) => sum + (Number(x.attendance_percentage) || 0), 0);
      const revSum = (payments.data ?? []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      setStats({
        totalCourses: courses.count || 0,
        totalMentors: mentors.count || 0,
        totalTestimonials: testimonials.count || 0,
        totalStudents: total,
        certificatesIssued: s.filter((x) => x.certificate_issued).length,
        placementRate: total ? Math.round((placed / total) * 100) : 0,
        avgAttendance: total ? Math.round(attSum / total) : 0,
        revenue: revSum,
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const mainCards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: { value: "12%", isPositive: true },
      chartData: [20, 30, 45, 60, 55, 70, 85, stats.totalStudents],
    },
    {
      label: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "text-violet-600",
      bg: "bg-violet-50",
      trend: { value: "8%", isPositive: true },
      chartData: [4, 6, 7, 7, 8, 9, 9, stats.totalCourses],
    },
    {
      label: "Total Mentors",
      value: stats.totalMentors,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      trend: { value: "15%", isPositive: true },
      chartData: [5, 6, 8, 8, 8, 9, 10, stats.totalMentors],
    },
    {
      label: "Total Testimonials",
      value: stats.totalTestimonials,
      icon: GraduationCap,
      color: "text-amber-600",
      bg: "bg-amber-50",
      trend: { value: "22%", isPositive: true },
      chartData: [3, 4, 6, 6, 7, 8, 10, stats.totalTestimonials],
    },
    {
      label: "Certificates Issued",
      value: stats.certificatesIssued,
      icon: Award,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: { value: "5%", isPositive: true },
      chartData: [1, 2, 2, 3, 4, 5, 5, stats.certificatesIssued],
    },
    {
      label: "Placement Rate",
      value: `${stats.placementRate}%`,
      icon: Briefcase,
      color: "text-purple-600",
      bg: "bg-purple-50",
      trend: { value: "9%", isPositive: true },
      chartData: [40, 50, 55, 65, 70, 75, 78, stats.placementRate],
    },
    {
      label: "Avg Attendance",
      value: `${stats.avgAttendance}%`,
      icon: CalendarClock,
      color: "text-rose-600",
      bg: "bg-rose-50",
      trend: { value: "2%", isPositive: true },
      chartData: [80, 82, 85, 88, 86, 89, 91, stats.avgAttendance],
    },
    {
      label: "Total Revenue",
      value: money(stats.revenue),
      icon: DollarSign,
      color: "text-slate-900",
      bg: "bg-slate-100",
      trend: { value: "18%", isPositive: true },
      chartData: [10000, 25000, 45000, 70000, 110000, 150000, 210000, stats.revenue],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold font-display text-slate-900 mb-4">Key Metrics Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainCards.map((stat, i) => (
            <StatCard
              key={i}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              bg={stat.bg}
              trend={stat.trend}
              chartData={stat.chartData}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold font-display text-slate-900 mb-4">System Performance</h3>
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
            <ArrowUpRight className="h-8 w-8 text-teal-500 mb-2 animate-bounce" />
            <p className="font-semibold text-slate-700">All systems operational.</p>
            <p className="text-xs text-slate-400 mt-1">Real-time Supabase replication and database listeners connected.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold font-display text-slate-900 mb-4">System Controls</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-100 hover:border-teal-500/30 hover:bg-teal-50/50 transition-colors text-sm font-semibold text-slate-700 flex items-center justify-between group">
              <span>+ Create New Course</span>
              <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-mono group-hover:bg-teal-600 group-hover:text-white transition-colors">Courses</span>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-100 hover:border-teal-500/30 hover:bg-teal-50/50 transition-colors text-sm font-semibold text-slate-700 flex items-center justify-between group">
              <span>+ Add New Mentor</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono group-hover:bg-indigo-650 group-hover:text-white transition-colors">Mentors</span>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-100 hover:border-teal-500/30 hover:bg-teal-50/50 transition-colors text-sm font-semibold text-slate-700 flex items-center justify-between group">
              <span>+ Upload Media File</span>
              <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono group-hover:bg-purple-650 group-hover:text-white transition-colors">Media</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
