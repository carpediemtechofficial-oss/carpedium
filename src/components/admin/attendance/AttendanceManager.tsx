import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Settings, 
  Calendar, 
  FileSpreadsheet, 
  UserCheck, 
  UserMinus, 
  Clock, 
  AlertTriangle,
  Download,
  Search,
  Filter,
  RefreshCw,
  Info,
  FileText
} from "lucide-react";
import StatusBadge from "../shared/StatusBadge";
import EmptyState from "../shared/EmptyState";
import { CSVImportTab } from "./CSVImportTab";

type AttendanceRecord = {
  id: string;
  student_id: string;
  student_name: string;
  course: string;
  batch: string;
  date: string;
  status: "Present" | "Absent" | "Late" | "Leave";
  check_in: string | null;
  check_out: string | null;
  mentor: string | null;
  remarks: string | null;
};

type SyncLog = {
  id: string;
  synced_at: string;
  status: "Success" | "Failed";
  rows_synced: number;
  error_message: string | null;
};

export default function AttendanceManager() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "daily" | "import" | "history" | "reports" | "settings">("dashboard");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  // Settings State
  const [formUrl, setFormUrl] = useState("");
  const [formId, setFormId] = useState("");
  const [sheetId, setSheetId] = useState("");
  const [sheetName, setSheetName] = useState("Form Responses 1");
  const [scriptUrl, setScriptUrl] = useState("https://script.google.com/macros/s/AKfycbzelgxwYksAjyZMrw-WmDyfCA1FEsH6srBvE4anqXKFcCXtIL_EDnxBuCj9PPZFLmsBCA/exec");
  const [apiKey, setApiKey] = useState("carpediem-attendance-sync-2026");
  const [enableAutoSync, setEnableAutoSync] = useState(false);
  const [syncInterval, setSyncInterval] = useState(60);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterStatus, setFilterStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchAttendance();
    fetchSyncLogs();
    fetchStudents();

    // Set up realtime subscriptions
    const attendanceSub = supabase
      .channel("attendance-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "student_attendance" }, () => {
        fetchAttendance();
        fetchStudents();
      })
      .subscribe();

    const logsSub = supabase
      .channel("logs-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_sync_logs" }, () => {
        fetchSyncLogs();
        fetchSettings();
      })
      .subscribe();

    return () => {
      attendanceSub.unsubscribe();
      logsSub.unsubscribe();
    };
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "attendance_settings")
      .single();

    if (!error && data) {
      const config = data.value;
      setFormUrl(config.formUrl || "");
      setFormId(config.formId || "");
      setSheetId(config.sheetId || "");
      setSheetName(config.sheetName || "Form Responses 1");
      setScriptUrl(config.scriptUrl || "https://script.google.com/macros/s/AKfycbzelgxwYksAjyZMrw-WmDyfCA1FEsH6srBvE4anqXKFcCXtIL_EDnxBuCj9PPZFLmsBCA/exec");
      setApiKey(config.apiKey || "carpediem-attendance-sync-2026");
      setEnableAutoSync(config.enableAutoSync || false);
      setSyncInterval(config.syncInterval || 60);
      setLastSynced(config.lastSynced || null);
      setLastStatus(config.lastStatus || null);
    } else {
      // Create default settings if missing
      await supabase.from("settings").insert({
        key: "attendance_settings",
        value: {
          formUrl: "",
          formId: "",
          sheetId: "",
          sheetName: "Form Responses 1",
          scriptUrl: "https://script.google.com/macros/s/AKfycbzelgxwYksAjyZMrw-WmDyfCA1FEsH6srBvE4anqXKFcCXtIL_EDnxBuCj9PPZFLmsBCA/exec",
          apiKey: "carpediem-attendance-sync-2026",
          enableAutoSync: false,
          syncInterval: 60,
          lastSynced: null,
          lastStatus: null,
        }
      });
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("student_attendance")
      .select("*")
      .order("date", { ascending: false });

    if (!error && data) {
      setAttendance(data);
    }
    setLoading(false);
  };

  const fetchSyncLogs = async () => {
    const { data, error } = await supabase
      .from("attendance_sync_logs")
      .select("*")
      .order("synced_at", { ascending: false })
      .limit(30);

    if (!error && data) {
      setSyncLogs(data);
    }
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("full_name");

    if (!error && data) {
      setStudents(data);
    }
  };

  // Auto-extract Google Form ID from the form URL
  const handleFormUrlChange = (url: string) => {
    setFormUrl(url);
    // Extract the form ID from URLs like:
    // https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform
    // https://docs.google.com/forms/d/1FAIpQLSc.../edit
    const match = url.match(/\/forms\/d\/(?:e\/)?([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      setFormId(match[1]);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      formUrl,
      formId,
      sheetId,
      sheetName,
      scriptUrl,
      apiKey,
      enableAutoSync,
      syncInterval,
      lastSynced,
      lastStatus,
    };

    const { error } = await supabase
      .from("settings")
      .update({ value: config })
      .eq("key", "attendance_settings");

    if (!error) {
      toast.success("Attendance Form integration settings saved successfully!");
    } else {
      toast.error("Failed to save settings: " + error.message);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    toast.info("Connecting to Google Form API and syncing responses...");
    
    try {
      const response = await fetch("/api/attendance/sync");
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Sync complete! Loaded ${result.syncedRows} records. ${result.unmatchedCount} rows unmatched.`);
        fetchAttendance();
        fetchSyncLogs();
        fetchSettings();
      } else {
        toast.error("Sync failed: " + (result.error || "Unknown server error"));
      }
    } catch (e) {
      toast.error("Connection failed. Verify server is running.");
    } finally {
      setSyncing(false);
    }
  };

  // Metrics computations
  const todayDate = new Date().toISOString().split("T")[0];
  const todayRecords = attendance.filter(r => r.date === filterDate);
  const presentToday = todayRecords.filter(r => r.status === "Present" || r.status === "Late").length;
  const absentToday = todayRecords.filter(r => r.status === "Absent").length;
  const lateToday = todayRecords.filter(r => r.status === "Late").length;
  const leaveToday = todayRecords.filter(r => r.status === "Leave").length;
  const totalToday = todayRecords.length;
  const attendanceRate = totalToday > 0 ? ((presentToday / totalToday) * 100).toFixed(1) : "0.0";

  // Low attendance alerts (<75%)
  const lowAttendanceStudents = students.filter(s => s.total_classes > 0 && s.attendance_percentage < 75);

  // Filters logic
  const filteredDaily = attendance.filter(r => {
    const matchesSearch = r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || r.student_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourse ? r.course === filterCourse : true;
    const matchesBatch = filterBatch ? r.batch === filterBatch : true;
    const matchesDate = filterDate ? r.date === filterDate : true;
    const matchesStatus = filterStatus ? r.status === filterStatus : true;
    return matchesSearch && matchesCourse && matchesBatch && matchesDate && matchesStatus;
  });

  const uniqueCourses = [...new Set(students.map(s => s.course_name).filter(Boolean))];
  const uniqueBatches = [...new Set(students.map(s => s.batch).filter(Boolean))];

  // Export triggers
  const handleExport = (format: "csv" | "excel") => {
    if (filteredDaily.length === 0) {
      toast.warning("No records found to export.");
      return;
    }

    const headers = "Student ID,Student Name,Course,Batch,Date,Status,Check In,Check Out,Remarks\n";
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers
      + filteredDaily.map(r => `"${r.student_id}","${r.student_name}","${r.course}","${r.batch}","${r.date}","${r.status}","${r.check_in || ''}","${r.check_out || ''}","${r.remarks || ''}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${filterDate || "All"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Attendance exported successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Tabs list */}
      <div className="flex border-b border-slate-200 gap-6">
        {[
          { id: "dashboard", label: "Dashboard", icon: UserCheck },
          { id: "daily", label: "Daily Attendance", icon: Calendar },
          { id: "import", label: "Import CSV", icon: FileSpreadsheet },
          { id: "history", label: "Attendance History", icon: Clock },
          { id: "reports", label: "Reports", icon: FileText },
          { id: "settings", label: "Settings", icon: Settings },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === t.id 
                ? "border-teal-500 text-teal-600" 
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content: OVERVIEW / DASHBOARD ─────────────────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Filters for today's snapshot date */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">Select Date for Snapshot:</span>
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-200 outline-none"
              />
            </div>
            
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-[#111827] text-white hover:bg-slate-800 rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "Syncing..." : "Sync Sheets Now"}</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Present Today", value: presentToday, icon: UserCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
              { label: "Absent Today", value: absentToday, icon: UserMinus, color: "text-rose-600 bg-rose-50 border-rose-100" },
              { label: "Late Arrivals", value: lateToday, icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100" },
              { label: "On Approved Leave", value: leaveToday, icon: Info, color: "text-blue-600 bg-blue-50 border-blue-100" },
              { label: "Attendance Rate", value: `${attendanceRate}%`, icon: FileSpreadsheet, color: "text-teal-600 bg-teal-50 border-teal-100" },
            ].map((card, i) => (
              <div key={i} className={`p-4 rounded-xl border bg-white flex items-center justify-between shadow-sm`}>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-extrabold text-slate-800 mt-2">{card.value}</p>
                </div>
                <div className={`p-2.5 rounded-lg border ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            ))}
          </div>

          {/* Low Attendance & Alert Dashboard Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sync status card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Auto Sync Integration</h3>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Enable Auto-Sync (1 min):</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                      enableAutoSync ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {enableAutoSync ? "ON" : "OFF"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Last Sync Time:</span>
                    <span className="font-mono text-slate-800 font-semibold">
                      {lastSynced ? new Date(lastSynced).toLocaleTimeString() : "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Last Status:</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                      lastStatus === "Success" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}>
                      {lastStatus || "No logs"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-6">
                <p className="text-[11px] text-slate-400 font-medium">
                  Connect public-read links (`Anyone with link can view`) to verify synced rows directly without manual inserts.
                </p>
              </div>
            </div>

            {/* Low attendance alerts card */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  <span>Low Attendance Alerts (&lt;75%)</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100">
                  {lowAttendanceStudents.length} Students
                </span>
              </div>

              {lowAttendanceStudents.length === 0 ? (
                <div className="h-36 flex items-center justify-center text-sm text-slate-400 font-semibold">
                  🎉 Good job! All students satisfy minimum attendance thresholds.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {lowAttendanceStudents.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{s.full_name}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{s.course_name} • {s.batch}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-rose-600">{s.attendance_percentage}%</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Attended: {s.classes_attended}/{s.total_classes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Content: DAILY ATTENDANCE LOGS ────────────────────────── */}
      {activeTab === "daily" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-lg font-bold text-slate-900">Daily Logs</h3>
              <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-650 text-xs font-bold">
                {filteredDaily.length} Records
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleExport("csv")}
                className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-600 transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Student..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-xs outline-none focus:border-teal-500"
              />
            </div>
            
            <select
              value={filterCourse}
              onChange={e => setFilterCourse(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs outline-none focus:border-teal-500"
            >
              <option value="">All Courses</option>
              {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={filterBatch}
              onChange={e => setFilterBatch(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs outline-none focus:border-teal-500"
            >
              <option value="">All Batches</option>
              {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs outline-none focus:border-teal-500"
            />

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs outline-none focus:border-teal-500"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Leave">Leave</option>
            </select>
          </div>

          {/* Records Table */}
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-500 font-mono text-xs">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading Logs...
            </div>
          ) : filteredDaily.length === 0 ? (
            <EmptyState title="No Attendance Logs found" description="Try selecting a different date filter or triggering a fresh sheet synchronization." />
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-55 bg-slate-50/50 text-slate-500 font-mono text-[10px] uppercase tracking-wider border-b border-slate-100">
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Course / Batch</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Check-in / Out</th>
                    <th className="p-3">Mentor</th>
                    <th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredDaily.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div>
                          <p className="font-bold text-slate-800">{record.student_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {record.student_id}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-slate-600">{record.course}</p>
                        <p className="text-xs text-slate-450 mt-0.5">{record.batch}</p>
                      </td>
                      <td className="p-3 font-mono text-xs text-slate-550">{record.date}</td>
                      <td className="p-3">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="p-3 font-mono text-xs text-slate-550">
                        {record.check_in || "--:--"} - {record.check_out || "--:--"}
                      </td>
                      <td className="p-3 text-xs font-semibold text-slate-500">{record.mentor || "---"}</td>
                      <td className="p-3 text-xs text-slate-400 italic max-w-[160px] truncate" title={record.remarks || ""}>
                        {record.remarks || "No remarks"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab Content: IMPORT CSV ──────────────────────────────────── */}
      {activeTab === "import" && <CSVImportTab />}

      {/* ── Tab Content: ATTENDANCE HISTORY ──────────────────────────── */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-slate-900">Student Attendance History</h3>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase tracking-wider border-b border-slate-100">
                  <th className="p-3">Student</th>
                  <th className="p-3">Course / Batch</th>
                  <th className="p-3">Total Classes</th>
                  <th className="p-3">Attended</th>
                  <th className="p-3">Attendance Rate</th>
                  <th className="p-3">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {students.map(s => {
                  const rate = s.attendance_percentage || 0;
                  const isAtRisk = s.total_classes > 0 && rate < 75;
                  
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">{s.full_name}</td>
                      <td className="p-3 text-xs text-slate-500">{s.course_name} • {s.batch}</td>
                      <td className="p-3 font-mono text-slate-650">{s.total_classes || 0}</td>
                      <td className="p-3 font-mono text-slate-650">{s.classes_attended || 0}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${isAtRisk ? "text-rose-600" : "text-emerald-600"}`}>{rate}%</span>
                          <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isAtRisk ? "bg-rose-500" : "bg-emerald-500"}`}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {isAtRisk ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-600 border border-rose-100">
                            At Risk
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                            Good
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab Content: REPORTS ────────────────────────────────────── */}
      {activeTab === "reports" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-slate-900">Attendance Reports</h3>
          <p className="text-slate-500 text-sm">Generate and export detailed attendance reports.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
             <div className="border border-slate-200 p-6 rounded-xl text-center hover:border-teal-500 transition-colors group cursor-pointer" onClick={() => handleExport("csv")}>
                <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-3 group-hover:text-teal-600" />
                <h4 className="font-bold text-slate-800">Daily Report</h4>
                <p className="text-xs text-slate-500 mt-1">Export today's attendance</p>
             </div>
             <div className="border border-slate-200 p-6 rounded-xl text-center hover:border-teal-500 transition-colors group cursor-pointer" onClick={() => handleExport("csv")}>
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-3 group-hover:text-teal-600" />
                <h4 className="font-bold text-slate-800">Weekly Report</h4>
                <p className="text-xs text-slate-500 mt-1">Export last 7 days</p>
             </div>
             <div className="border border-slate-200 p-6 rounded-xl text-center hover:border-teal-500 transition-colors group cursor-pointer" onClick={() => handleExport("csv")}>
                <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-3 group-hover:text-teal-600" />
                <h4 className="font-bold text-slate-800">Monthly Report</h4>
                <p className="text-xs text-slate-500 mt-1">Export current month</p>
             </div>
          </div>
        </div>
      )}

      {/* ── Tab Content: SETTINGS ────────────────────────────────────── */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <h3 className="font-display text-lg font-bold text-slate-900 mb-6">General Attendance Settings</h3>
          
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Working Hours Start
                </label>
                <input
                  type="time"
                  defaultValue="09:00"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Working Hours End
                </label>
                <input
                  type="time"
                  defaultValue="18:00"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Default Status
              </label>
              <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500 transition-all font-medium">
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Duplicate Handling Strategy
              </label>
              <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500 transition-all font-medium">
                <option value="overwrite">Overwrite with new records</option>
                <option value="skip">Skip duplicates</option>
                <option value="error">Fail import</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
              <button
                type="submit"
                className="bg-[#111827] hover:bg-slate-850 text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-all shadow-sm"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
